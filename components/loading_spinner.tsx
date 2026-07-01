export function LoadingSpinner({ label }: { label?: string })
{
    return (
        <div className="flex items-center gap-3 text-sm text-slate-600">
            <span
                className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700"
                aria-hidden="true"
            />
            {label ? <span>{label}</span> : null}
        </div>
    );
}
