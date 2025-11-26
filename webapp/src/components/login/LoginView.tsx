import { useState } from 'react'
import logoUrl from '../../../public/Logo-RMG-mới-PNG.png'
import type {
  RoleKey,
  EmployeeLoginForm,
  ManagerRole,
  ManagementLoginForm,
} from '../../types'

export interface AccountOption {
  role: RoleKey
  profileId: string
  title: string
  subtitle: string
  description: string
  gradient: string
  accentBorder: string
}

interface LoginViewProps {
  options: AccountOption[]
  employeeForm: EmployeeLoginForm
  loginError: string | null
  isLoadingEmployees: boolean
  onEmployeeFieldChange: (field: keyof EmployeeLoginForm, value: string) => void
  onEmployeeLogin: () => void
  managementForms: Record<ManagerRole, ManagementLoginForm>
  managementErrors: Partial<Record<ManagerRole, string | null>>
  managementLoadingRole: ManagerRole | null
  onManagementFieldChange: (
    role: ManagerRole,
    field: keyof ManagementLoginForm,
    value: string,
  ) => void
  onManagementLogin: (role: ManagerRole) => void
}

export const LoginView = ({
  employeeForm,
  loginError,
  isLoadingEmployees,
  onEmployeeFieldChange,
  onEmployeeLogin,
  managementForms,
  managementErrors,
  managementLoadingRole,
  onManagementFieldChange,
  onManagementLogin,
}: LoginViewProps) => {
  const [activeLoginType, setActiveLoginType] = useState<'employee' | 'itManager' | 'leadership'>('employee')

  const handleEmployeeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onEmployeeLogin()
  }

  const handleManagementSubmit = (e: React.FormEvent<HTMLFormElement>, role: ManagerRole) => {
    e.preventDefault()
    onManagementLogin(role)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Layer 0: Nền Sâu (Deep Background) - đã được thiết lập trong body */}

      {/* Layer 1, 2, 3: Wrapper với viền ánh sáng động và Card chính */}
      <div className="login-card-wrapper">
        {/* Layer 2: Wrapper & Shadow - Container giữ viền gradient */}
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{
            background: 'var(--bg-dark)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          }}
        >
          {/* Layer 3: Card Đăng Nhập Chính (Main Login Card) - Glassmorphism */}
          <div
            className="login-card w-full max-w-sm rounded-2xl p-8"
            style={{
              minWidth: '384px',
            }}
          >
            {/* 1. Phần Đầu (Header & Branding) */}
            <div className="mb-8 text-center">
              {/* Logo */}
              <div className="mb-6 flex justify-center">
                <img
                  src={logoUrl}
                  alt="RMG Logo"
                  className="h-14 w-auto"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/vite.svg'
                  }}
                />
              </div>

              {/* Tiêu đề chính */}
              <h1 className="mb-2 text-3xl font-extrabold tracking-wider text-text-light">
                TRUNG TÂM HỖ TRỢ IT
              </h1>

              {/* Tiêu đề phụ */}
              <p className="text-sm text-gray-500">
                Đăng nhập để tạo và theo dõi yêu cầu dịch vụ
              </p>
            </div>

            {/* Tab Navigation */}
            <div className="mb-6 flex gap-4 border-b border-border-dark">
              <button
                type="button"
                onClick={() => setActiveLoginType('employee')}
                className={`pb-3 text-sm font-semibold transition-all ${activeLoginType === 'employee'
                    ? 'border-b-2 border-accent-cyan text-accent-cyan'
                    : 'text-text-subtle hover:text-text-light'
                  }`}
              >
                NHÂN VIÊN
              </button>
              <button
                type="button"
                onClick={() => setActiveLoginType('itManager')}
                className={`pb-3 text-sm font-semibold transition-all ${activeLoginType === 'itManager'
                    ? 'border-b-2 border-accent-cyan text-accent-cyan'
                    : 'text-text-subtle hover:text-text-light'
                  }`}
              >
                IT MANAGER
              </button>
              <button
                type="button"
                onClick={() => setActiveLoginType('leadership')}
                className={`pb-3 text-sm font-semibold transition-all ${activeLoginType === 'leadership'
                    ? 'border-b-2 border-accent-cyan text-accent-cyan'
                    : 'text-text-subtle hover:text-text-light'
                  }`}
              >
                LEADERSHIP
              </button>
            </div>

            {/* 2. Phần Form (Input Fields) - Employee Login */}
            {activeLoginType === 'employee' && (
              <form className="mb-6 space-y-5" onSubmit={handleEmployeeSubmit}>
                {/* Error Message */}
                {loginError && (
                  <div className="rounded-lg bg-red-500/20 border border-red-500/50 px-4 py-3 text-sm text-red-300">
                    {loginError}
                  </div>
                )}

                {/* Name Input */}
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm text-white">
                    Tên đăng nhập
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={employeeForm.name}
                    onChange={(e) => onEmployeeFieldChange('name', e.target.value)}
                    className="input-field w-full rounded-lg px-4 py-3 text-text-light placeholder:text-gray-500 focus:outline-none"
                    placeholder="Nhập tên của bạn"
                    disabled={isLoadingEmployees}
                  />
                </div>

                {/* Password Input */}
                <div>
                  <label htmlFor="password" className="mb-2 block text-sm text-white">
                    Mật khẩu
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={employeeForm.password}
                    onChange={(e) => onEmployeeFieldChange('password', e.target.value)}
                    className="input-field w-full rounded-lg px-4 py-3 text-text-light placeholder:text-gray-500 focus:outline-none"
                    placeholder="Nhập mật khẩu"
                    disabled={isLoadingEmployees}
                  />
                </div>

                {/* 3. Phần Tùy Chọn & CTA */}
                <div className="flex items-center justify-between pt-2">
                  {/* Ghi nhớ tôi - Checkbox */}
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-400">
                    <input
                      type="checkbox"
                      name="remember"
                      className="h-4 w-4 rounded border-gray-500 bg-[#0d1014] text-primary-blue focus:ring-2 focus:ring-primary-blue focus:ring-offset-0"
                      disabled={isLoadingEmployees}
                    />
                    <span>Ghi nhớ tôi</span>
                  </label>

                  {/* Quên mật khẩu - Link */}
                  <a
                    href="#"
                    className="text-sm text-primary-blue transition hover:text-[#3b82f6] hover:underline"
                    onClick={(e) => e.preventDefault()}
                  >
                    Quên mật khẩu?
                  </a>
                </div>

                {/* 3. Phần Tùy Chọn & CTA - Nút Đăng nhập (CTA - Call To Action) */}
                <div className="group relative pt-4">
                  {/* Glow Dưới Nút - Hiệu ứng tỏa sáng nhẹ, chỉ hiển thị khi hover */}
                  <div
                    className="absolute inset-x-0 -bottom-2 h-12 rounded-xl bg-indigo-500 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100"
                    style={{ zIndex: 0 }}
                  />

                  {/* Nút Đăng nhập - Gradient purple-blue */}
                  <button
                    type="submit"
                    disabled={isLoadingEmployees}
                    className="login-cta-button relative z-10 w-full rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 px-4 py-3 text-lg font-semibold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#0d1014] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundSize: '200% 200%',
                      animation: isLoadingEmployees ? 'none' : 'gradient-shift 3s ease infinite',
                    }}
                  >
                    {isLoadingEmployees ? 'Đang đăng nhập...' : 'Đăng nhập'}
                  </button>
                </div>
              </form>
            )}

            {/* Management Login Forms - IT Manager */}
            {activeLoginType === 'itManager' && (
              <form
                className="mb-6 space-y-5"
                onSubmit={(e) => handleManagementSubmit(e, 'itManager')}
              >
                {managementErrors.itManager && (
                  <div className="rounded-lg bg-red-500/20 border border-red-500/50 px-4 py-3 text-sm text-red-300">
                    {managementErrors.itManager}
                  </div>
                )}

                <div>
                  <label htmlFor="it-username" className="mb-2 block text-sm text-white">
                    Tên đăng nhập
                  </label>
                  <input
                    type="text"
                    id="it-username"
                    value={managementForms.itManager.username}
                    onChange={(e) => onManagementFieldChange('itManager', 'username', e.target.value)}
                    className="input-field w-full rounded-lg px-4 py-3 text-text-light placeholder:text-gray-500 focus:outline-none"
                    placeholder="Nhập tên đăng nhập (ví dụ: it)"
                    disabled={managementLoadingRole === 'itManager'}
                  />
                </div>

                <div>
                  <label htmlFor="it-password" className="mb-2 block text-sm text-white">
                    Mật khẩu
                  </label>
                  <input
                    type="password"
                    id="it-password"
                    value={managementForms.itManager.password}
                    onChange={(e) => onManagementFieldChange('itManager', 'password', e.target.value)}
                    className="input-field w-full rounded-lg px-4 py-3 text-text-light placeholder:text-gray-500 focus:outline-none"
                    placeholder="Nhập mật khẩu"
                    disabled={managementLoadingRole === 'itManager'}
                  />
                </div>

                <div className="group relative pt-4">
                  <div
                    className="absolute inset-x-0 -bottom-2 h-12 rounded-xl bg-indigo-500 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100"
                    style={{ zIndex: 0 }}
                  />
                  <button
                    type="submit"
                    disabled={managementLoadingRole === 'itManager'}
                    className="login-cta-button relative z-10 w-full rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 px-4 py-3 text-lg font-semibold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#0d1014] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundSize: '200% 200%',
                      animation: managementLoadingRole === 'itManager' ? 'none' : 'gradient-shift 3s ease infinite',
                    }}
                  >
                    {managementLoadingRole === 'itManager' ? 'Đang đăng nhập...' : 'Đăng nhập IT Manager'}
                  </button>
                </div>
              </form>
            )}

            {/* Management Login Forms - Leadership */}
            {activeLoginType === 'leadership' && (
              <form
                className="mb-6 space-y-5"
                onSubmit={(e) => handleManagementSubmit(e, 'leadership')}
              >
                {managementErrors.leadership && (
                  <div className="rounded-lg bg-red-500/20 border border-red-500/50 px-4 py-3 text-sm text-red-300">
                    {managementErrors.leadership}
                  </div>
                )}

                <div>
                  <label htmlFor="leadership-username" className="mb-2 block text-sm text-white">
                    Tên đăng nhập
                  </label>
                  <input
                    type="text"
                    id="leadership-username"
                    value={managementForms.leadership.username}
                    onChange={(e) => onManagementFieldChange('leadership', 'username', e.target.value)}
                    className="input-field w-full rounded-lg px-4 py-3 text-text-light placeholder:text-gray-500 focus:outline-none"
                    placeholder="Nhập tên đăng nhập (ví dụ: leadership)"
                    disabled={managementLoadingRole === 'leadership'}
                  />
                </div>

                <div>
                  <label htmlFor="leadership-password" className="mb-2 block text-sm text-white">
                    Mật khẩu
                  </label>
                  <input
                    type="password"
                    id="leadership-password"
                    value={managementForms.leadership.password}
                    onChange={(e) => onManagementFieldChange('leadership', 'password', e.target.value)}
                    className="input-field w-full rounded-lg px-4 py-3 text-text-light placeholder:text-gray-500 focus:outline-none"
                    placeholder="Nhập mật khẩu"
                    disabled={managementLoadingRole === 'leadership'}
                  />
                </div>

                <div className="group relative pt-4">
                  <div
                    className="absolute inset-x-0 -bottom-2 h-12 rounded-xl bg-indigo-500 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100"
                    style={{ zIndex: 0 }}
                  />
                  <button
                    type="submit"
                    disabled={managementLoadingRole === 'leadership'}
                    className="login-cta-button relative z-10 w-full rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 px-4 py-3 text-lg font-semibold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#0d1014] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundSize: '200% 200%',
                      animation: managementLoadingRole === 'leadership' ? 'none' : 'gradient-shift 3s ease infinite',
                    }}
                  >
                    {managementLoadingRole === 'leadership' ? 'Đang đăng nhập...' : 'Đăng nhập Leadership'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
