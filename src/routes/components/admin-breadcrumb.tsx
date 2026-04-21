import { Breadcrumb } from "@chakra-ui/react";
import { Fragment } from "react/jsx-runtime";
import { Link as RouterLink } from "react-router";

//------------------------------------------------------------------------------
// Admin Breadcrumb
//------------------------------------------------------------------------------

export type AdminBreadcrumbItem = {
  label: string;
  to?: string;
};

export type AdminBreadcrumbProps = {
  items: AdminBreadcrumbItem[];
};

export default function AdminBreadcrumb({ items }: AdminBreadcrumbProps) {
  return (
    <Breadcrumb.Root>
      <Breadcrumb.List>
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;
          const hasSeparator = index < items.length - 1;

          return (
            <Fragment key={`${item.label}-${index}`}>
              <Breadcrumb.Item>
                {item.to && !isCurrent ?
                  <Breadcrumb.Link asChild>
                    <RouterLink to={item.to}>{item.label}</RouterLink>
                  </Breadcrumb.Link>
                : isCurrent ?
                  <Breadcrumb.CurrentLink>{item.label}</Breadcrumb.CurrentLink>
                : <Breadcrumb.Link>{item.label}</Breadcrumb.Link>}
              </Breadcrumb.Item>
              {hasSeparator && <Breadcrumb.Separator />}
            </Fragment>
          );
        })}
      </Breadcrumb.List>
    </Breadcrumb.Root>
  );
}
