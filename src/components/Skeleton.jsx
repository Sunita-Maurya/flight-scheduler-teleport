export const Skeleton = () => (
  <tr>
    {Array.from({ length: 13 }).map((_, i) => (
      <td key={i} className="p-3">
        <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
      </td>
    ))}
  </tr>
);
