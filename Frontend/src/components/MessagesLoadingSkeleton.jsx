// Widths roughly mimic a real back-and-forth so the skeleton settles
// into the loaded thread without a visible jump.
const ROWS = [
  { own: false, width: "58%" },
  { own: true, width: "42%" },
  { own: false, width: "34%" },
  { own: false, width: "66%" },
  { own: true, width: "50%" },
  { own: true, width: "30%" },
];

function MessagesLoadingSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-3" aria-busy="true" aria-label="Loading messages">
      {ROWS.map((row, index) => (
        <div key={index} className={`flex items-end gap-2 ${row.own ? "flex-row-reverse" : ""}`}>
          {!row.own && <div className="skeleton size-7 shrink-0 rounded-full" />}
          <div
            className="skeleton h-11 rounded-2xl"
            style={{ width: row.width, maxWidth: "70%" }}
          />
        </div>
      ))}
    </div>
  );
}
export default MessagesLoadingSkeleton;
