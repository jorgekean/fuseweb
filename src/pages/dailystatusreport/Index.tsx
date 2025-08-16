import React from "react"
import html2canvas from "html2canvas"
import { FaMailBulk } from "react-icons/fa"
import { BiMailSend } from "react-icons/bi"

const DailyStatusReport = () => {
  const captureScreenshot = async () => {
    try {
      const element = document.getElementById("screenshot-target") // Element to capture
      const canvas = await html2canvas(element!)
      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png")
      )

      if (blob && navigator.clipboard) {
        await navigator.clipboard.write([
          new ClipboardItem({
            "image/png": blob as Blob,
          }),
        ])
        alert("Screenshot copied to clipboard! You can paste it in your email.")
      } else {
        alert("Clipboard API not supported in your browser.")
      }
    } catch (error) {
      console.error("Failed to capture or copy screenshot:", error)
      alert("An error occurred while capturing the screenshot.")
    }
  }

  const openEmail = () => {
    const subject = encodeURIComponent("Pre-filled Email Subject")
    const body = encodeURIComponent("This is the body of the email.")
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  const handleSendEmail = async () => {
    await captureScreenshot() // Copy screenshot to clipboard
    openEmail() // Open email app
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md sticky top-0 z-10">
      <div
        id="screenshot-target"
        style={{ border: "1px solid black", padding: "20px" }}
      >
        This is the content to screenshot!
      </div>
      <button
        className="flex mt-2 items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary2"
        onClick={handleSendEmail}
      >
        <BiMailSend size={20} /> Send
      </button>
    </div>
  )
}

export default DailyStatusReport
