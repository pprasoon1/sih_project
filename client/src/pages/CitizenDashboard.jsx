import React, { useState, useEffect } from "react";
import axios from "axios";

const CitizenDashboard = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("pothole");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [lng, setLng] = useState(null);
  const [lat, setLat] = useState(null);
  const [loading, setLoading] = useState(false);

  // Auto detect location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLng(pos.coords.longitude);
          setLat(pos.coords.latitude);
        },
        (err) => {
          console.error("⚠️ Location error:", err);
        }
      );
    }
  }, []);

  // File input change
  const handleFileChange = (e) => {
    setMediaFiles(Array.from(e.target.files));
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Get token from localStorage
    const userToken = localStorage.getItem("token");
    if (!userToken) {
      alert("You are not logged in. Please log in to submit a report.");
      return;
    }

    if (!lng || !lat) {
      alert("Location not available. Please enable location services.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("coordinates", JSON.stringify([lng, lat])); // send as JSON string

    mediaFiles.forEach((file) => {
      formData.append("media", file); // key must match multer config
    });

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5001/api/reports", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${userToken}`, // Use token from localStorage
        },
      });
      console.log(formData)
      console.log("✅ Report created:", res.data);
      alert("Report submitted successfully!");

      // reset form
      setTitle("");
      setDescription("");
      setCategory("pothole");
      setMediaFiles([]);
    } catch (err) {
      console.error("❌ Error creating report:", err);
      alert("Error submitting report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Report an Issue</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full border rounded-lg px-3 py-2 mt-1"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
            className="w-full border rounded-lg px-3 py-2 mt-1"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mt-1"
          >
            <option value="pothole">Pothole</option>
            <option value="streetlight">Streetlight</option>
            <option value="garbage">Garbage</option>
            <option value="water">Water</option>
            <option value="tree">Tree</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* File Upload - Opens camera on mobile */}
        <div>
          <label className="block text-sm font-medium">Upload Photo/Video</label>
          <input
            type="file"
            accept="image/*,video/*"
            capture="environment" // opens camera on mobile
            multiple
            onChange={handleFileChange}
            className="mt-2"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Report"}
        </button>
      </form>
    </div>
  );
};

export default CitizenDashboard;