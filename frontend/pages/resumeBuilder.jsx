import React, { useState } from 'react';

function ResumeUploader({ onDataExtracted }) {
  const handleFileUpload = async (e) => {
    const formData = new FormData();
    formData.append("resume", e.target.files[0]);

    try {
      const res = await fetch("https://resume-grop-ai.onrender.com/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        onDataExtracted(data);
      } else {
        alert("Resume parsing failed: " + data.error);
      }
    } catch (err) {
      console.error("Upload failed", err);
      alert("Error uploading resume.");
    }
  };

  return (
    <div className="mb-6">
      <label
        htmlFor="resume-upload"
        className="flex items-center gap-2 cursor-pointer font-medium text-blue-700 hover:underline"
      >
        <span role="img" aria-label="Upload" className="text-2xl">📄</span>
        <span>Upload Resume PDF</span>
      </label>
      <input
        type="file"
        accept=".pdf"
        id="resume-upload"
        onChange={handleFileUpload}
        className="mt-2 block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      <p className="text-xs text-gray-500 mt-1">
        Supported format: <span className="font-semibold">PDF only</span>
      </p>
    </div>
  );
}

export default function ResumeBuilder() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    linkedIn: '',
    github: '',
    summary: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const [tips, setTips] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare the data to send to the backend
    const resumeData = {
      name: form.fullName,
      email: form.email,
      phone: form.phone,
      address: form.address,
      linkedIn: form.linkedIn,
      github: form.github,
      summary: form.summary
    };

    setLoading(true);
    setError(null);
    setTips(null);

    try {
      const res = await fetch("https://resume-grop-ai.onrender.com/analyze-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(resumeData)
      });

      const data = await res.json();
      if (res.ok) {
        setTips(data.tips);
      } else {
        setError(data.error || "Unknown error");
      }
    } catch (err) {
      console.error("Analysis failed", err);
      setError("Error analyzing resume.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-2 sm:px-0">
      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <div className="mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-blue-700 mb-2">Resume Builder</h1>
            <p className="text-gray-600">Upload your resume or fill out the form below</p>
          </div>
        </div>

        <ResumeUploader
          onDataExtracted={(data) => {
            setForm((prev) => ({
              ...prev,
              fullName: data.name || prev.fullName,
              email: data.email || prev.email,
              phone: data.phone || prev.phone,
              address: data.address || prev.address,
              linkedIn: data.linkedIn || prev.linkedIn,
              github: data.github || prev.github,
              summary: data.summary || prev.summary
            }));
          }}
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="fullName" 
                value={form.fullName} 
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input 
                type="email" 
                name="email" 
                value={form.email} 
                onChange={handleChange}
                placeholder="your.email@example.com"
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input 
                type="tel" 
                name="phone" 
                value={form.phone} 
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input 
                type="text" 
                name="address" 
                value={form.address} 
                onChange={handleChange}
                placeholder="City, State, Country"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                LinkedIn Profile
              </label>
              <input 
                type="url" 
                name="linkedIn" 
                value={form.linkedIn} 
                onChange={handleChange}
                placeholder="https://linkedin.com/in/yourprofile"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GitHub Profile
              </label>
              <input 
                type="url" 
                name="github" 
                value={form.github} 
                onChange={handleChange}
                placeholder="https://github.com/yourusername"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Professional Summary
            </label>
            <textarea 
              name="summary" 
              value={form.summary} 
              onChange={handleChange} 
              rows="4"
              placeholder="Write a brief professional summary highlighting your key skills and experience..."
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="flex justify-end">
            <button 
              type="submit"
              disabled={loading}
              className={`px-6 py-2 rounded font-semibold text-white transition-colors duration-200 ${
                loading
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Analyzing...
                </span>
              ) : (
                "Generate"
              )}
            </button>
          </div>
        </form>

        {/* Section to show the response data */}
        <div className="mt-10">
          {loading && (
            <div className="flex items-center gap-2 text-blue-700 font-medium">
              <svg className="animate-spin h-5 w-5 text-blue-700" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Analyzing your resume, please wait...
            </div>
          )}
          {error && (
            <div className="mt-4 text-red-600 font-semibold flex items-center gap-2">
              <span>❌</span> {error}
            </div>
          )}
          {tips && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-blue-700 mb-3">Resume Tips</h2>
              <ul className="list-decimal pl-6 space-y-2 text-gray-800 whitespace-pre-line">
                {tips
                  .split('\n')
                  .filter(line => line.trim())
                  .map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
