'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Header } from './header';
import { Sidebar } from './sidebar';

interface MainLayoutProps {
	children: React.ReactNode;
	className?: string;
}

export function MainLayout({ children, className }: MainLayoutProps) {
	const [sidebarOpen, setSidebarOpen] = React.useState(false);

	return (
		<div className="flex h-screen bg-background">
			{/* Sidebar */}
			<aside
				className={cn(
					'fixed inset-y-0 left-0 z-50 w-64 transform transition-transform md:relative md:translate-x-0',
					sidebarOpen ? 'translate-x-0' : '-translate-x-full',
				)}
			>
				<Sidebar />
			</aside>

			{/* Overlay for mobile */}
			{sidebarOpen && (
				<button
					className="fixed inset-0 z-40 bg-black/50 md:hidden border-0 p-0 cursor-pointer"
					onClick={() => setSidebarOpen(false)}
					aria-label="Close sidebar"
					type="button"
				/>
			)}

			{/* Main content */}
			<div className="flex flex-1 flex-col overflow-hidden">
				<Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
				<main className={cn('flex-1 overflow-auto p-6', className)}>
					{children}
				</main>
			</div>
		</div>
	);
}
