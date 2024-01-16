import { Link } from "react-router-dom";
import logo from "../../assets/logo.svg";

export default function Header() {
  return (
    <Link to="/" className="flex justify-center align-middle my-2 p-1">
      <img
        src={logo}
        alt="happy things logo"
        className=" h-1/5 min-w-330 min-h-100"
      />
    </Link>
  );
}
