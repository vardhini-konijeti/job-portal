import { Badge } from "@/components/ui/badge";
import type { UserRoleType } from "@shared/schema";
import { UserRole } from "@shared/schema";

interface RoleBadgeProps {
  role: UserRoleType;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const getRoleDisplay = (role: UserRoleType) => {
    switch (role) {
      case UserRole.SUPERADMIN:
        return { label: "Superadmin", variant: "default" as const };
      case UserRole.RECRUITER:
        return { label: "Recruiter", variant: "secondary" as const };
      case UserRole.APPLICANT:
        return { label: "Applicant", variant: "outline" as const };
      default:
        return { label: role, variant: "outline" as const };
    }
  };

  const { label, variant } = getRoleDisplay(role);

  return (
    <Badge variant={variant} className={className} data-testid={`badge-role-${role}`}>
      {label}
    </Badge>
  );
}
