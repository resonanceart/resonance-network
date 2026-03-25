export default function DashboardLoading() {
  return (
    <div className="dashboard-skeleton">
      <div className="container">
        {/* Header skeleton */}
        <div className="dashboard-skeleton__header">
          <div className="dashboard-skeleton__avatar" />
          <div className="dashboard-skeleton__lines">
            <div className="dashboard-skeleton__line dashboard-skeleton__line--lg" />
            <div className="dashboard-skeleton__line dashboard-skeleton__line--sm" />
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="dashboard-skeleton__stats">
          <div className="dashboard-skeleton__stat" />
          <div className="dashboard-skeleton__stat" />
          <div className="dashboard-skeleton__stat" />
        </div>

        {/* Content skeleton */}
        <div className="dashboard-skeleton__section">
          <div className="dashboard-skeleton__line dashboard-skeleton__line--md" />
          <div className="dashboard-skeleton__card" />
          <div className="dashboard-skeleton__card" />
        </div>
      </div>
    </div>
  )
}
