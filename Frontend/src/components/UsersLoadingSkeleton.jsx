function UsersLoadingSkeleton() {
  return (
    <div className="space-y-1" aria-busy="true" aria-label="Loading conversations">
      {[0, 1, 2, 3, 4].map((item) => (
        <div key={item} className="flex items-center gap-3 rounded-2xl p-2.5">
          <div className="skeleton size-11 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-3.5" style={{ width: `${68 - item * 7}%` }} />
            <div className="skeleton h-2.5 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
export default UsersLoadingSkeleton;
