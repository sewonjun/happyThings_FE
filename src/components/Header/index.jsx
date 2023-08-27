import { Link } from "react-router-dom";
import logo from "../../assets/logo.svg";

export default function Header() {
  return (
    <Link to="/home" className="flex justify-center">
      <img
        src={logo}
        alt="happy things logo"
        className="m-10 mx-auto max-w-screen-sm"
      />
    </Link>
  );
}
