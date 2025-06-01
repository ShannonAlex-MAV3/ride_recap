import { NavItem } from "@/@types";
import { Link } from "react-router-dom";
import { Home, CarFront, Users, Cog, PersonStanding, Hammer } from "lucide-react";

export const NavBar = () => {
  return (
    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
      {navItems.map((item, index) => (
        <NavBarItem key={`nav-item-${index}`} {...item} />
      ))}
    </nav>
  );
};

export const NavBarItem = (props: NavItem) => {
  return (
    <Link
      to={props.to}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
    >
      {props.icon}
      {props.label}
    </Link>
  );
};

export const navItems: NavItem[] = [
  {
    icon: <Home className="h-4 w-4" />,
    label: "Home",
    to: "/home",
  },
  {
    icon: <CarFront className="h-4 w-4" />,
    label: "Service",
    to: "/service",
  },
  {
    icon: <Hammer className="h-4 w-4" />,
    label: "Repair",
    to: "/repair",
  },
  {
    icon: <PersonStanding className="h-4 w-4" />,
    label: "Customer",
    to: "/customer",
  },
  {
    icon: <Cog className="h-4 w-4" />,
    label: "Job Configuration",
    to: "/job-config",
  },
  {
    icon: <Users className="h-4 w-4" />,
    label: "Users",
    to: "/users",
  },
];
