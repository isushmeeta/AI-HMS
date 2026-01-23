import toast from 'react-hot-toast';

export const confirmAction = (onConfirm, message = 'Are you sure?', title = 'Confirmation') => {
    toast((t) => (
        <div className="flex flex-col gap-2 p-1 min-w-[200px]">
            <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 text-sm">{title}</span>
            </div>
            <p className="text-slate-600 text-sm whitespace-pre-line">{message}</p>
            <div className="flex gap-2 justify-end mt-2">
                <button
                    onClick={() => toast.dismiss(t.id)}
                    className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={() => {
                        onConfirm();
                        toast.dismiss(t.id);
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors"
                >
                    Confirm
                </button>
            </div>
        </div>
    ), {
        duration: 6000,
        position: 'top-center',
        style: {
            padding: '12px',
            borderRadius: '16px',
            border: '1px solid #F1F5F9',
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        },
    });
};
