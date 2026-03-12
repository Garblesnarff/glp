import { NavLink } from "react-router-dom";
import { palette, sans, radii, transitions } from "../../lib/design-tokens";

export function NavItem({
  to,
  label,
  icon,
}: {
  to: string;
  label: string;
  icon: string;
}) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 16px",
        borderRadius: radii.sm,
        textDecoration: "none",
        fontFamily: sans,
        fontSize: 13,
        fontWeight: isActive ? 700 : 500,
        color: isActive ? palette.accent : palette.textMuted,
        background: isActive ? palette.accentSoft : "transparent",
        borderLeft: isActive ? `3px solid ${palette.accent}` : "3px solid transparent",
        transition: `all ${transitions.fast}`,
      })}
    >
      <span style={{ fontSize: 18, width: 24, textAlign: "center" }}>{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
}
