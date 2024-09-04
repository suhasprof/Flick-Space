import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useCreateMovieMutation,
  useUploadImageMutation,
} from "../../redux/api/movies";
import { useFetchGenresQuery } from "../../redux/api/genre";
import { toast } from "react-toastify";

const CreateMovie = () => {
  const navigate = useNavigate();

  const [movieData, setMovieData] = useState({
    name: "",
    year: 0,
    detail: "",
    cast: "",
    rating: 0,
    image: null,
    genre: "",
  });

  const [selectedImage, setSelectedImage] = useState(null);

  const [createMovie, { isLoading: isCreatingMovie }] =
    useCreateMovieMutation();
  const [uploadImage, { isLoading: isUploadingImage }] =
    useUploadImageMutation();

  const { data: genres, isLoading: isLoadingGenres } = useFetchGenresQuery();

  useEffect(() => {
    if (genres && genres.length) {
      setMovieData((prevData) => ({
        ...prevData,
        genre: genres[0]._id || "",
      }));
    }
  }, [genres]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMovieData((prevData) => ({
      ...prevData,
      [name]: name === "cast" ? value.split(",") : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedImage(file);
  };

  const handleCreateMovie = async () => {
    if (
      !movieData.name ||
      !movieData.year ||
      !movieData.detail ||
      !movieData.cast.length ||
      !selectedImage
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      let uploadedImagePath = null;

      if (selectedImage) {
        const formData = new FormData();
        formData.append("image", selectedImage);

        const uploadImageResponse = await uploadImage(formData).unwrap();
        uploadedImagePath = uploadImageResponse.image;

        await createMovie({
          ...movieData,
          image: uploadedImagePath,
        }).unwrap();

        toast.success("Movie Added To Database");
        navigate("/admin/movies-list");
        setMovieData({
          name: "",
          year: 0,
          detail: "",
          cast: "",
          rating: 0,
          image: null,
          genre: "",
        });
        setSelectedImage(null);
      }
    } catch (error) {
      const errorMessage = error?.data?.message || "Failed to create movie";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="container flex justify-center items-center mt-4">
      <form>
        <p className="text-green-200 w-[50rem] text-2xl mb-4">Create Movie</p>

        <div className="mb-4">
          <label className="block">
            Name:
            <input
              type="text"
              name="name"
              value={movieData.name}
              onChange={handleChange}
              className="border px-2 py-1 w-full"
            />
          </label>
        </div>

        <div className="mb-4">
          <label className="block">
            Year:
            <input
              type="number"
              name="year"
              value={movieData.year}
              onChange={handleChange}
              className="border px-2 py-1 w-full"
            />
          </label>
        </div>

        <div className="mb-4">
          <label className="block">
            Detail:
            <textarea
              name="detail"
              value={movieData.detail}
              onChange={handleChange}
              className="border px-2 py-1 w-full"
            />
          </label>
        </div>

        <div className="mb-4">
          <label className="block">
            Cast (comma-separated):
            <input
              type="text"
              name="cast"
              value={movieData.cast}
              onChange={handleChange}
              className="border px-2 py-1 w-full"
            />
          </label>
        </div>

        <div className="mb-4">
          <label className="block">
            Genre:
            <select
              name="genre"
              value={movieData.genre}
              onChange={handleChange}
              className="border px-2 py-1 w-full"
            >
              {isLoadingGenres ? (
                <option>Loading genres...</option>
              ) : (
                genres.map((genre) => (
                  <option key={genre._id} value={genre._id}>
                    {genre.name}
                  </option>
                ))
              )}
            </select>
          </label>
        </div>

        <div className="mb-4">
          <label className="block">
            Upload Image:
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block"
            />
          </label>
        </div>

        <button
          type="button"
          onClick={handleCreateMovie}
          className="bg-teal-500 text-white px-4 py-2 rounded"
          disabled={isCreatingMovie || isUploadingImage}
        >
          {isCreatingMovie || isUploadingImage ? "Creating..." : "Create Movie"}
        </button>
      </form>
    </div>
  );
};

export default CreateMovie;
