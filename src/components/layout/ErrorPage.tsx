import React from 'react';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ErrorPageProps {
	title?: string;
	message?: string;
	errorCode?: string | number;
	showRetry?: boolean;
	showHome?: boolean;
	showBack?: boolean;
	onRetry?: () => void;
	onHome?: () => void;
	onBack?: () => void;
}

const ErrorPage: React.FC<ErrorPageProps> = ({
	title = "エラーが発生しました",
	message = "申し訳ございません。予期しないエラーが発生しました。しばらくしてから再度お試しください。",
	errorCode,
	showRetry = true,
	showHome = true,
	showBack = false,
	onRetry,
	onHome,
	onBack
}) => {
	const handleRetry = () => {
		if (onRetry) {
			onRetry();
		} else {
			window.location.reload();
		}
	};

	const handleHome = () => {
		if (onHome) {
			onHome();
		} else {
			window.location.href = '/';
		}
	};

	const handleBack = () => {
		if (onBack) {
			onBack();
		} else {
			window.history.back();
		}
	};

	return (
		<div className="w-full h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
			<div className="max-w-md w-full space-y-6">
				{/* メインエラーアイコン */}
				<div className="text-center">
					<div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
						<AlertTriangle className="w-10 h-10 text-red-600" />
					</div>

					{errorCode && (
						<div className="text-sm font-mono text-slate-500 mb-2">
							Error {errorCode}
						</div>
					)}

					<h1 className="text-2xl font-bold text-slate-900 mb-3">
						{title}
					</h1>
				</div>

				{/* エラーメッセージ */}
				<Alert className="border-red-200 bg-red-50">
					<AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
					<AlertDescription className="text-slate-700 break-words overflow-wrap-anywhere leading-relaxed">
						{message}
					</AlertDescription>
				</Alert>

				{/* アクションボタン */}
				<div className="space-y-3">
					{showRetry && (
						<button
							onClick={handleRetry}
							className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 group"
						>
							<RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
							再試行
						</button>
					)}

					<div className="flex gap-3">
						{showBack && (
							<button
								onClick={handleBack}
								className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
							>
								<ArrowLeft className="w-4 h-4" />
								戻る
							</button>
						)}

						{showHome && (
							<button
								onClick={handleHome}
								className={`${showBack ? 'flex-1' : 'w-full'} bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2`}
							>
								<Home className="w-4 h-4" />
								ホーム
							</button>
						)}
					</div>
				</div>

				{/* フッター */}
				<div className="text-center text-sm text-slate-500">
					問題が解決しない場合は、
					<a href="/contact" className="text-blue-600 hover:text-blue-700 underline ml-1">
						サポートにお問い合わせください
					</a>
				</div>
			</div>
		</div>
	);
};

export default ErrorPage;