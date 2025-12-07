import { useEffect, useRef, useState } from "react"
import { useDropzone } from "react-dropzone"
import { FiUploadCloud } from "react-icons/fi"

import "video-react/dist/video-react.css"
import { Player } from "video-react"

export default function Upload({
  name,
  label,
  register,
  setValue,
  errors,
  video = false,
  viewData = null,
  editData = null,
}) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewSource, setPreviewSource] = useState(
    viewData ? viewData : editData ? editData : ""
  )
  const inputRef = useRef(null)

  const onDrop = (acceptedFiles) => {
    console.log("🎯 onDrop called!")
    console.log("Accepted files:", acceptedFiles)

    const file = acceptedFiles[0]
    if (file) {
      console.log("✅ File selected:", file.name, file.type, file.size)
      previewFile(file)
      setSelectedFile(file)
    } else {
      console.log("❌ No file selected")
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: !video
      ? { "image/*": [".jpeg", ".jpg", ".png"] }
      : { "video/*": [".mp4"] },
    onDrop,
    multiple: false,
    noClick: true, // ✅ Disable default click handling
    onDropRejected: (fileRejections) => {
      console.error("❌ File rejected:", fileRejections)
    },
  })

  const previewFile = (file) => {
    console.log("📸 Starting preview for:", file.name)
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onloadend = () => {
      console.log("✅ Preview generated")
      setPreviewSource(reader.result)
    }
    reader.onerror = (error) => {
      console.error("❌ FileReader error:", error)
    }
  }

  useEffect(() => {
    register(name, { required: true })
  }, [register, name])

  useEffect(() => {
    if (selectedFile) {
      console.log("📤 Setting value:", name, selectedFile.name)
      setValue(name, selectedFile)
    }
  }, [selectedFile, setValue, name])

  // ✅ Manual click handler - Opens file dialog directly
  const handleClick = (e) => {
    console.log("🖱️ Click detected, opening file dialog...")
    if (inputRef.current) {
      inputRef.current.click()
    } else {
      console.error("❌ inputRef is null")
    }
  }

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm text-richblack-5" htmlFor={name}>
        {label} {!viewData && <sup className="text-pink-200">*</sup>}
      </label>
      <div
        className={`${
          isDragActive ? "bg-richblack-600" : "bg-richblack-700"
        } flex min-h-[250px] cursor-pointer items-center justify-center rounded-md border-2 border-dotted border-richblack-500`}
      >
        {previewSource ? (
          <div className="flex flex-col w-full p-6">
            {!video ? (
              <img
                src={previewSource}
                alt="Preview"
                className="object-cover w-full h-full rounded-md"
              />
            ) : (
              <Player aspectRatio="16:9" playsInline src={previewSource} />
            )}
            {!viewData && (
              <button
                type="button"
                onClick={() => {
                  console.log("🗑️ Canceling upload")
                  setPreviewSource("")
                  setSelectedFile(null)
                  setValue(name, null)
                }}
                className="mt-3 underline text-richblack-400"
              >
                Cancel
              </button>
            )}
          </div>
        ) : (
          <div
            className="flex flex-col items-center w-full p-6"
            {...getRootProps()}
            onClick={handleClick} // ✅ Add manual click handler
          >
            <input {...getInputProps()} ref={inputRef} />
            <div className="grid rounded-full aspect-square w-14 place-items-center bg-pure-greys-800">
              <FiUploadCloud className="text-2xl text-yellow-50" />
            </div>
            <p className="mt-2 max-w-[200px] text-center text-sm text-richblack-200">
              Drag and drop an {!video ? "image" : "video"}, or click to{" "}
              <span className="font-semibold text-yellow-50">Browse</span> a
              file
            </p>
            <ul className="flex justify-between mt-10 space-x-12 text-xs text-center list-disc text-richblack-200">
              <li>Aspect ratio 16:9</li>
              <li>Recommended size 1024x576</li>
            </ul>
          </div>
        )}
      </div>
      {errors[name] && (
        <span className="ml-2 text-xs tracking-wide text-pink-200">
          {label} is required
        </span>
      )}
    </div>
  )
}
