import Container from "react-bootstrap/Container"
import Navbar from "react-bootstrap/Navbar"
import Logo from "../../../public/fuse-logo.png"

function AppBar() {
  return (
    <>
      <Navbar style={{ backgroundColor: "#fff" }}>
        <Container>
          <Navbar.Brand href="/" className="">
            {/* <img
              alt=""
              src={Logo}
              width="60"
              height="30"
              className="d-inline-block align-top"
            />{" "} */}
            {/* Logo Here */}
          </Navbar.Brand>
        </Container>
      </Navbar>
    </>
  )
}

export default AppBar
