const loading = () => {
  return (
    <div className="container px-20 animate-pulse">
      {/* Title Skeleton */}
      <div className="skeleton h-8 w-48 mb-8"></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {/* Table Header Skeleton */}
          <div className="skeleton h-12 w-full"></div>
          {/* Table Row Skeletons */}
          <div className="skeleton h-20 w-full"></div>
          <div className="skeleton h-20 w-full"></div>
          <div className="skeleton h-20 w-full"></div>

          {/* Action Buttons Skeleton */}
          <div className="flex justify-between mt-6">
            <div className="skeleton h-12 w-44"></div>
            <div className="skeleton h-12 w-32"></div>
          </div>
        </div>

        <div>
          {/* Summary Skeleton */}
          <div className="skeleton h-96 w-full"></div>
        </div>
      </div>
    </div>
  );
};

export default loading;
