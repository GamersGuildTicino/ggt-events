import { Grid, type GridProps } from "@chakra-ui/react";

//------------------------------------------------------------------------------
// Admin Content Columns
//------------------------------------------------------------------------------

export type AdminContentColumnsProps = GridProps & {
  maxColumns?: number;
  minColumnWidth?: string;
};

export default function AdminContentColumns({
  maxColumns = 2,
  minColumnWidth = "20rem",
  ...rest
}: AdminContentColumnsProps) {
  const columnShare = `calc((100% - (${maxColumns} - 1) * var(--chakra-spacing-4)) / ${maxColumns})`;
  const columnWidth = `min(100%, max(${minColumnWidth}, ${columnShare}))`;

  return (
    <Grid
      alignItems="flex-start"
      gap={4}
      justifyContent="start"
      templateColumns={`repeat(auto-fill, minmax(${columnWidth}, 1fr))`}
      w="full"
      {...rest}
    />
  );
}
