import { Button } from "react-bootstrap"

const OracleUpload = () => {
  const openNewWindow = () => {
    // Open a new window with a specific URL
    const newWindow = window.open(
      "https://appswtwprod.willistowerswatson.com/",
      "_blank"
    )

    if (newWindow) {
      // Attach a listener to handle messages from the new window
      window.addEventListener("message", handleMessage)

      // Send a message to the new window
      newWindow.postMessage(
        "Hello from the main window!",
        "https://appswtwprod.willistowerswatson.com/"
      )
    } else {
      console.error("Failed to open the new window.")
    }

    // Check if the new window is successfully opened
    // if (newWindow) {
    //     // Execute some JS code on the new window via console
    //     newWindow.window.onload = () => {
    //         // Example: Log a message in the console of the new window
    //         // newWindow.alert();
    //         newWindow.window.alert("Hello from the new window!");

    //     };
    // } else {
    //     // Handle the case where the new window couldn't be opened
    //     console.error("Failed to open the new window.");
    // }
  }

  const handleMessage = (event: any) => {
    // Check the origin of the message to ensure it's from the expected domain
    if (event.origin === "https://appswtwprod.willistowerswatson.com/") {
      // Handle the message received from the new window
      console.log("Message received in the main window:", event.data)

      // You can execute additional code based on the received message
    }
  }

  return (
    <div id="fuse-oracleupload">
      <div>OracleUpload</div>
      <Button onClick={openNewWindow}>Upload</Button>
    </div>
  )
}

export default OracleUpload
