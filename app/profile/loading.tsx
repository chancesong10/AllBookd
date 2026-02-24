// app/profile/loading.tsx
export default function ProfileLoading() {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-8 mb-8">
            <div className="flex items-center gap-8">
              <div className="w-24 h-24 rounded-full bg-neutral-800 animate-pulse" />
              <div className="flex-1 space-y-3">
                <div className="h-8 w-48 bg-neutral-800 rounded animate-pulse" />
                <div className="h-4 w-64 bg-neutral-800 rounded animate-pulse" />
                <div className="h-4 w-96 bg-neutral-800 rounded animate-pulse" />
              </div>
            </div>  
          </div>
        </div>
      </div>
    )
  }