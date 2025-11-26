import { useEffect, useMemo, useRef, useState } from 'react'
import { api } from './api'
import { EmployeeDashboard } from './components/employee/EmployeeDashboard'
import { ItManagerDashboard } from './components/it/ItManagerDashboard'
import { LeadershipDashboard } from './components/leadership/LeadershipDashboard'
import { LoginView, type AccountOption } from './components/login/LoginView'
import type {
  CreationFeedback,
  Employee,
  EmployeeLoginForm,
  ManagementLoginForm,
  ManagerRole,
  PriorityKey,
  RoleKey,
  ServiceRequest,
  SlaOverview,
  StatusKey,
} from './types'
import { mapEmployee, mapRequest, mapNote, getSlaTargetHours } from './utils/mappers'
import { slaSeverity } from './utils/time'
import { parseEmployeeExcel } from './utils/excel'

interface Session {
  role: RoleKey
  profileId: string
}

const fallbackItProfile: Employee = {
  id: 'it-manager-placeholder',
  name: 'Quản lý IT',
  email: 'it.manager@rmg123.com',
  department: 'IT Operations',
  avatarColor: 'from-cyan-500 to-blue-600',
}

const fallbackLeadershipProfile: Employee = {
  id: 'leadership-placeholder',
  name: 'Ban Lãnh Đạo',
  email: 'leadership@rmg123.com',
  department: 'Điều hành',
  avatarColor: 'from-amber-400 to-orange-500',
}

const accountOptions: AccountOption[] = [
  {
    role: 'employee',
    profileId: 'employee-placeholder',
    title: 'Nhân viên',
    subtitle: 'Khởi tạo & theo dõi yêu cầu',
    description: '',
    gradient: 'from-sky-500/20 via-cyan-500/10 to-blue-500/10',
    accentBorder: 'border-sky-400/40',
  },
  {
    role: 'itManager',
    profileId: fallbackItProfile.id,
    title: 'Quản lý IT',
    subtitle: 'Tiếp nhận & xử lý yêu cầu',
    description: '',
    gradient: 'from-emerald-500/20 via-teal-500/10 to-slate-900/40',
    accentBorder: 'border-emerald-400/40',
  },
  {
    role: 'leadership',
    profileId: fallbackLeadershipProfile.id,
    title: 'Ban lãnh đạo',
    subtitle: 'Giám sát SLA & hiệu suất',
    description: '',
    gradient: 'from-amber-500/25 via-orange-500/10 to-indigo-500/10',
    accentBorder: 'border-amber-400/40',
  },
]

const initialEmployeeForm: Employee & { id: string } = {
  id: '',
  name: '',
  email: '',
  department: '',
  avatarColor: '',
}

const SESSION_STORAGE_KEY = 'it_request_session'

function App() {
  // Load session from localStorage on mount
  const [session, setSession] = useState<Session | null>(() => {
    try {
      const saved = localStorage.getItem(SESSION_STORAGE_KEY)
      if (saved) {
        return JSON.parse(saved) as Session
      }
    } catch (error) {
      console.error('Failed to load session from localStorage', error)
    }
    return null
  })
  const [employees, setEmployees] = useState<Employee[]>([])
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)
  const [noteDraft, setNoteDraft] = useState('')
  const [creationFeedback, setCreationFeedback] = useState<CreationFeedback | null>(null)
  const [formState, setFormState] = useState({
    title: '',
    type: '',
    description: '',
    priority: 'medium' as PriorityKey,
    estimatedCost: null as number | null,
  })
  const [employeeLoginForm, setEmployeeLoginForm] = useState<EmployeeLoginForm>({
    name: '',
    password: '',
  })
  const [loginError, setLoginError] = useState<string | null>(null)
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false)
  const [isLoadingRequests, setIsLoadingRequests] = useState(false)
  const [notesLoadingId, setNotesLoadingId] = useState<string | null>(null)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [employeeDirectorySearch, setEmployeeDirectorySearch] = useState('')
  const [employeeForm, setEmployeeForm] = useState(initialEmployeeForm)
  const [employeeFormFeedback, setEmployeeFormFeedback] = useState<CreationFeedback | null>(null)
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null)
  const [importFeedback, setImportFeedback] = useState<string | null>(null)
  const [managementLoginForms, setManagementLoginForms] = useState<
    Record<ManagerRole, ManagementLoginForm>
  >({
    itManager: { username: 'Nguyễn Trung Hải', password: '' },
    leadership: { username: 'Lê Thanh Tùng', password: '' },
  })
  const [managementLoginErrors, setManagementLoginErrors] = useState<
    Record<ManagerRole, string | null>
  >({
    itManager: null,
    leadership: null,
  })
  const [managementLoadingRole, setManagementLoadingRole] = useState<ManagerRole | null>(null)
  const [managementProfiles, setManagementProfiles] = useState<Record<ManagerRole, Employee>>({
    itManager: fallbackItProfile,
    leadership: fallbackLeadershipProfile,
  })
  const importInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (session?.role === 'employee') {
      setSelectedEmployeeId(session.profileId)
    } else if (employees.length > 0) {
      setSelectedEmployeeId(employees[0].id)
    }
  }, [session, employees])

  const refreshRequests = async (employeeId?: string) => {
    setIsLoadingRequests(true)
    try {
      const data = await api.getRequests(employeeId ? { employeeId } : undefined)
      setRequests((prev) => {
        const notesById = new Map(prev.map((req) => [req.id, req.notes]))
        return data.map((dto) => mapRequest(dto, notesById.get(dto.id) ?? []))
      })
    } catch (error) {
      console.error('Không thể tải danh sách yêu cầu', error)
    } finally {
      setIsLoadingRequests(false)
    }
  }

  const refreshEmployees = async () => {
    setIsLoadingEmployees(true)
    try {
      const data = await api.getEmployees()
      const mapped = data.map(mapEmployee).sort(
        (a, b) => a.name.localeCompare(b.name, 'vi') || a.email.localeCompare(b.email),
      )
      setEmployees(mapped)
    } catch (error) {
      console.error('Không thể tải danh sách nhân viên', error)
    } finally {
      setIsLoadingEmployees(false)
    }
  }

  const refreshEmployeesForSession = async (profileId: string) => {
    setIsLoadingEmployees(true)
    try {
      const data = await api.getEmployees()
      const mapped = data.map(mapEmployee)
      const current = mapped.find((item) => item.id === profileId)
      setEmployees(current ? [current] : mapped)
    } catch (error) {
      console.error('Không thể tải danh sách nhân viên', error)
    } finally {
      setIsLoadingEmployees(false)
    }
  }

  const refreshRequestNotes = async (requestId: string) => {
    setNotesLoadingId(requestId)
    try {
      const notes = await api.getRequestNotes(requestId)
      setRequests((prev) =>
        prev.map((req) => (req.id === requestId ? { ...req, notes: notes.map(mapNote) } : req)),
      )
    } catch (error) {
      console.error('Không thể tải ghi chú', error)
    } finally {
      setNotesLoadingId(null)
    }
  }

  useEffect(() => {
    if (!session) {
      setEmployees([])
      setRequests([])
      return
    }

    if (session.role === 'employee') {
      void refreshEmployeesForSession(session.profileId)
      void refreshRequests(session.profileId)
    } else {
      void refreshEmployees()
      void refreshRequests()
    }
  }, [session])

  useEffect(() => {
    if (!selectedRequestId) return
    const current = requests.find((req) => req.id === selectedRequestId)
    if (!current || current.notes.length > 0) return
    void refreshRequestNotes(selectedRequestId)
  }, [selectedRequestId, requests])

  useEffect(() => {
    if (session?.role === 'itManager' && requests.length > 0 && !selectedRequestId) {
      setSelectedRequestId(requests[0].id)
    }
  }, [session, requests, selectedRequestId])

  useEffect(() => {
    if (session?.role !== 'employee') return
    requests.forEach((request) => {
      if (request.notes.length === 0) {
        void refreshRequestNotes(request.id)
      }
    })
  }, [session, requests])

  const filteredEmployees = useMemo(() => {
    if (!searchKeyword.trim()) return employees
    const keyword = searchKeyword.trim().toLowerCase()
    return employees.filter(
      (employee) =>
        employee.name.toLowerCase().includes(keyword) ||
        employee.email.toLowerCase().includes(keyword) ||
        employee.department.toLowerCase().includes(keyword),
    )
  }, [employees, searchKeyword])

  const filteredEmployeeDirectory = useMemo(() => {
    if (!employeeDirectorySearch.trim()) return employees
    const keyword = employeeDirectorySearch.trim().toLowerCase()
    return employees.filter((employee) =>
      [employee.name, employee.email, employee.department]
        .some((field) => field.toLowerCase().includes(keyword)),
    )
  }, [employees, employeeDirectorySearch])

  const activeProfile = useMemo(() => {
    if (!session) return null
    if (session.role === 'employee') {
      return (
        employees.find((employee) => employee.id === session.profileId) ??
        employees[0] ??
        null
      )
    }
    if (session.role === 'itManager') {
      return managementProfiles.itManager
    }
    return managementProfiles.leadership
  }, [session, employees, managementProfiles])

  const profileCard: Employee =
    activeProfile ??
    ({
      id: 'unknown',
      name: 'Tài khoản chưa xác định',
      email: '—',
      department: '',
      avatarColor: 'from-slate-500 to-slate-700',
    } satisfies Employee)

  const selectedEmployee = useMemo(() => {
    if (session?.role === 'employee') {
      const fromList = employees.find((employee) => employee.id === selectedEmployeeId)
      if (fromList) return fromList
      if (activeProfile) return activeProfile
      return {
        id: session.profileId,
        name: 'Nhân viên',
        email: '—',
        department: '—',
        avatarColor: 'from-slate-500 to-slate-700',
      }
    }

    if (employees.length === 0) {
      return {
        id: 'placeholder',
        name: 'Chưa có nhân viên',
        email: '—',
        department: '—',
        avatarColor: 'from-slate-500 to-slate-700',
      }
    }

    return (
      employees.find((employee) => employee.id === selectedEmployeeId) ??
      employees[0]
    )
  }, [session, employees, selectedEmployeeId, activeProfile])

  const myRequests = useMemo(
    () => requests.filter((item) => item.employeeId === selectedEmployee.id),
    [requests, selectedEmployee.id],
  )

  const slaOverview: SlaOverview = useMemo(() => {
    const total = requests.length
    const completed = requests.filter((r) => r.status === 'completed').length
    const breached = requests.filter(
      (r) => slaSeverity(r.targetSla, r.status) === 'breached',
    ).length

    const slaMet = requests.filter((r) => {
      if (r.status !== 'completed' || !r.completedAt) return false
      return new Date(r.completedAt).getTime() <= new Date(r.targetSla).getTime()
    }).length

    const avgResolutionHours = (() => {
      const finished = requests.filter((r) => r.status === 'completed' && r.completedAt)
      if (finished.length === 0) return null
      const totalHours = finished.reduce((sum, req) => {
        const created = new Date(req.createdAt).getTime()
        const done = new Date(req.completedAt!).getTime()
        return sum + (done - created) / (1000 * 60 * 60)
      }, 0)
      return totalHours / finished.length
    })()

    return {
      total,
      completed,
      breached,
      slaMet,
      avgResolutionHours,
    }
  }, [requests])

  const handleLogout = () => {
    setSession(null)
    localStorage.removeItem(SESSION_STORAGE_KEY)
    setSelectedRequestId(null)
    setCreationFeedback(null)
    setNoteDraft('')
    setSearchKeyword('')
    resetRequestForm()
    setEmployeeLoginForm({ name: '', password: '' })
    setManagementLoginForms({
      itManager: { username: 'Nguyễn Trung Hải', password: '' },
      leadership: { username: 'Lê Thanh Tùng', password: '' },
    })
  }

  const resetRequestForm = (priority: PriorityKey = 'medium') => {
    setFormState({
      title: '',
      type: '',
      description: '',
      priority,
      estimatedCost: null,
    })
  }

  const handleFormFieldChange = (field: 'title' | 'type' | 'description' | 'estimatedCost', value: string | number | null) => {
    setFormState((prev) => ({ ...prev, [field]: value }))
  }

  const handlePrioritySelect = (priority: PriorityKey) => {
    setFormState((prev) => ({ ...prev, priority }))
  }

  const handleManagementFieldChange = (
    role: ManagerRole,
    field: keyof ManagementLoginForm,
    value: string,
  ) => {
    setManagementLoginForms((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [field]: value,
      },
    }))
    setManagementLoginErrors((prev) => ({
      ...prev,
      [role]: null,
    }))
  }

  const handleManagementLogin = async (role: ManagerRole) => {
    const credentials = managementLoginForms[role]
    const username = credentials.username.trim()
    const password = credentials.password

    if (!username || !password.trim()) {
      setManagementLoginErrors((prev) => ({
        ...prev,
        [role]: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.',
      }))
      return
    }

    setManagementLoginErrors((prev) => ({
      ...prev,
      [role]: null,
    }))
    setManagementLoadingRole(role)
    try {
      const account = await api.loginManagement({ role, username, password })
      const profile: Employee = {
        id: account.id,
        name: account.displayName,
        email: account.email,
        department:
          account.department ??
          (role === 'itManager'
            ? fallbackItProfile.department
            : fallbackLeadershipProfile.department),
        avatarColor:
          role === 'itManager'
            ? fallbackItProfile.avatarColor
            : fallbackLeadershipProfile.avatarColor,
      }

      setManagementProfiles((prev) => ({
        ...prev,
        [role]: profile,
      }))

      const newSession = { role, profileId: account.id }
      setSession(newSession)
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession))
      setSelectedRequestId(null)
      setCreationFeedback(null)
      setNoteDraft('')
      setSearchKeyword('')
      resetRequestForm()
      setLoginError(null)
      setManagementLoginForms((prev) => ({
        ...prev,
        [role]: {
          username: account.displayName,
          password: '',
        },
      }))
    } catch (error) {
      setManagementLoginErrors((prev) => ({
        ...prev,
        [role]:
          error instanceof Error ? error.message : 'Không thể đăng nhập, vui lòng thử lại.',
      }))
    } finally {
      setManagementLoadingRole(null)
    }
  }

  const handleEmployeeLogin = async () => {
    const name = employeeLoginForm.name.trim()
    const password = employeeLoginForm.password.trim()

    if (!name || !password) {
      setLoginError('Vui lòng nhập Tên và Mật khẩu.')
      return
    }

    setLoginError(null)
    setIsLoadingEmployees(true)
    try {
      const account = await api.loginEmployee({ name, password })
      const mapped = mapEmployee(account)
      setEmployees([mapped])
      const newSession = { role: 'employee' as const, profileId: mapped.id }
      setSession(newSession)
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession))
      setSelectedEmployeeId(mapped.id)
      setEmployeeLoginForm({ name: '', password: '' })
      setSelectedRequestId(null)
      setCreationFeedback(null)
      setNoteDraft('')
      setSearchKeyword('')
      resetRequestForm()
      await refreshRequests(mapped.id)
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Không thể đăng nhập, vui lòng thử lại.')
    } finally {
      setIsLoadingEmployees(false)
    }
  }

  const handleCreateRequest = async () => {
    if (!selectedEmployeeId) {
      setCreationFeedback({
        type: 'error',
        message: 'Chưa có dữ liệu nhân viên. Vui lòng import trước khi tạo yêu cầu.',
      })
      return
    }

    if (!formState.type || !formState.description.trim() || !formState.title.trim()) {
      setCreationFeedback({
        type: 'error',
        message: 'Vui lòng điền đầy đủ tiêu đề, loại yêu cầu và mô tả chi tiết.',
      })
      return
    }

    const target = new Date(
      Date.now() + getSlaTargetHours(formState.priority) * 60 * 60 * 1000,
    )

    try {
      const created = await api.createRequest({
        title: formState.title,
        type: formState.type,
        description: formState.description,
        priority: formState.priority,
        targetSla: target.toISOString(),
        employeeId: selectedEmployee.id,
        estimatedCost: formState.estimatedCost ?? undefined,
      })

      const mapped = mapRequest(created, [])
      setRequests((prev) => [mapped, ...prev])
      setSelectedRequestId(mapped.id)
      setCreationFeedback({
        type: 'success',
        message: 'Yêu cầu mới đã được gửi tới IT.',
      })
      resetRequestForm(formState.priority)
    } catch (error) {
      setCreationFeedback({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Không thể tạo yêu cầu, vui lòng thử lại.',
      })
    }
  }

  const handleStatusUpdate = async (id: string, status: StatusKey) => {
    try {
      const updated = await api.updateRequestStatus(id, status)
      setRequests((prev) =>
        prev.map((request) =>
          request.id === id
            ? {
              ...request,
              status: updated.status as StatusKey,
              lastUpdated: updated.lastUpdated,
              completedAt: updated.completedAt ?? undefined,
            }
            : request,
        ),
      )
    } catch (error) {
      console.error('Không thể cập nhật trạng thái', error)
    }
  }

  const handleCostUpdate = async (id: string, confirmedCost: number | null) => {
    try {
      const updated = await api.updateRequestCost(id, confirmedCost)
      setRequests((prev) =>
        prev.map((request) =>
          request.id === id
            ? {
              ...request,
              confirmedCost: updated.confirmedCost ?? undefined,
              lastUpdated: updated.lastUpdated,
            }
            : request,
        ),
      )
      // selectedRequest sẽ tự động cập nhật vì nó được tính từ requests
    } catch (error) {
      console.error('Không thể cập nhật giá thành', error)
    }
  }

  const handleSendEmployeeRequest = async (id: string, message: string) => {
    try {
      const created = await api.sendEmployeeRequest(id, {
        message: message.trim(),
        author: 'Nguyễn Trung Hải, nhân viên IT',
      })
      const mapped = mapNote(created)

      // Cập nhật requests list
      setRequests((prev) =>
        prev.map((request) =>
          request.id === id
            ? {
              ...request,
              notes: [mapped, ...request.notes],
              status: 'waiting',
              lastUpdated: new Date().toISOString(),
            }
            : request,
        ),
      )
    } catch (error) {
      console.error('Không thể gửi yêu cầu cho nhân viên', error)
      throw error
    }
  }

  const handleDeleteRequest = async (id: string, employeeId: string) => {
    try {
      await api.deleteRequest(id, employeeId)
      setRequests((prev) => prev.filter((request) => request.id !== id))
      if (selectedRequestId === id) {
        setSelectedRequestId(null)
      }
      setCreationFeedback({
        type: 'success',
        message: 'Đã xóa yêu cầu thành công.',
      })
    } catch (error) {
      setCreationFeedback({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Không thể xóa yêu cầu, vui lòng thử lại.',
      })
    }
  }

  const handleAddNote = async (id: string, visibility: 'internal' | 'public') => {
    if (!noteDraft.trim()) return
    try {
      const created = await api.addRequestNote(id, {
        message: noteDraft.trim(),
        visibility,
        author: profileCard.name,
      })

      const mapped = mapNote(created)
      setRequests((prev) =>
        prev.map((request) =>
          request.id === id
            ? {
              ...request,
              notes: [mapped, ...request.notes],
            }
            : request,
        ),
      )
      setNoteDraft('')
    } catch (error) {
      console.error('Không thể thêm ghi chú', error)
    }
  }

  const handleSelectEmployeeForEdit = (employee: Employee) => {
    setEditingEmployeeId(employee.id)
    setEmployeeForm({ ...employee })
    setEmployeeFormFeedback(null)
  }

  const resetEmployeeForm = () => {
    setEmployeeForm(initialEmployeeForm)
    setEditingEmployeeId(null)
    setEmployeeFormFeedback(null)
  }

  const handleDeleteEmployee = async (id: string) => {
    try {
      await api.deleteEmployee(id)
      await refreshEmployees()
      if (editingEmployeeId === id) {
        resetEmployeeForm()
      }
      setEmployeeFormFeedback({
        type: 'success',
        message: 'Đã xóa nhân viên khỏi danh sách.',
      })
    } catch (error) {
      setEmployeeFormFeedback({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Không thể xóa nhân viên, vui lòng thử lại.',
      })
    }
  }

  const handleSaveEmployee = async () => {
    const name = employeeForm.name.trim()
    const department = employeeForm.department.trim()
    const emailInput = employeeForm.email.trim().toLowerCase()

    if (!name || !department || !emailInput) {
      setEmployeeFormFeedback({
        type: 'error',
        message: 'Vui lòng điền đầy đủ Họ tên, Email và Bộ phận.',
      })
      return
    }

    try {
      const saved = await api.upsertEmployee({
        name,
        email: emailInput,
        department,
      })

      const mapped = mapEmployee(saved)
      setEmployees((prev) => {
        const filtered = prev.filter((employee) => employee.id !== mapped.id)
        return [...filtered, mapped].sort(
          (a, b) => a.name.localeCompare(b.name, 'vi') || a.email.localeCompare(b.email),
        )
      })

      setEmployeeFormFeedback({
        type: 'success',
        message: editingEmployeeId
          ? 'Đã cập nhật thông tin nhân viên.'
          : 'Đã thêm nhân viên mới vào danh sách.',
      })
      resetEmployeeForm()
    } catch (error) {
      setEmployeeFormFeedback({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Không thể lưu nhân viên, vui lòng thử lại.',
      })
    }
  }

  const handleImportEmployees = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImportFeedback(`Đang xử lý file ${file.name}...`)
    setIsLoadingEmployees(true)

    try {
      const parsed = await parseEmployeeExcel(file)
      await api.bulkEmployees(parsed)
      setImportFeedback(`Đã import thành công ${parsed.length} nhân viên.`)

      if (session?.role === 'employee') {
        await refreshEmployeesForSession(session.profileId)
      } else {
        await refreshEmployees()
      }
    } catch (error) {
      setImportFeedback(
        error instanceof Error
          ? error.message
          : 'Không thể import dữ liệu từ file Excel.',
      )
    } finally {
      setIsLoadingEmployees(false)
      if (importInputRef.current) {
        importInputRef.current.value = ''
      }
      event.target.value = ''

      window.setTimeout(() => setImportFeedback(null), 7000)
    }
  }

  const handleEmployeeLoginFieldChange = (field: keyof EmployeeLoginForm, value: string) => {
    setEmployeeLoginForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleEmployeeFormChange = (field: keyof typeof employeeForm, value: string) => {
    setEmployeeForm((prev) => ({ ...prev, [field]: value }))
  }

  const selectedRequest = useMemo(
    () => requests.find((item) => item.id === selectedRequestId) ?? null,
    [requests, selectedRequestId],
  )

  if (!session) {
    return (
      <LoginView
        options={accountOptions}
        employeeForm={employeeLoginForm}
        loginError={loginError}
        isLoadingEmployees={isLoadingEmployees}
        onEmployeeFieldChange={handleEmployeeLoginFieldChange}
        onEmployeeLogin={handleEmployeeLogin}
        managementForms={managementLoginForms}
        managementErrors={managementLoginErrors}
        managementLoadingRole={managementLoadingRole}
        onManagementFieldChange={handleManagementFieldChange}
        onManagementLogin={handleManagementLogin}
      />
    )
  }

  return (
    <div className="relative h-screen overflow-hidden bg-[#080A0D] text-slate-100">
      <div className="relative mx-auto flex h-full w-full flex-col overflow-hidden">
        <main className={`flex-1 min-h-0 ${session?.role === 'leadership' || session?.role === 'itManager' ? 'overflow-y-auto' : 'overflow-hidden'}`}>
          {session.role === 'employee' && (
            <EmployeeDashboard
              selectedEmployee={selectedEmployee}
              formState={formState}
              onFormFieldChange={handleFormFieldChange}
              onPrioritySelect={handlePrioritySelect}
              onCreateRequest={handleCreateRequest}
              creationFeedback={creationFeedback}
              isEmployeeRole={session.role === 'employee'}
              searchKeyword={searchKeyword}
              onSearchKeywordChange={setSearchKeyword}
              filteredEmployees={filteredEmployees}
              onSelectEmployee={setSelectedEmployeeId}
              selectedEmployeeId={selectedEmployeeId}
              myRequests={myRequests}
              onMyRequestsUpdate={(updatedRequests) => {
                // Cập nhật requests để myRequests được tính toán lại
                setRequests((prev) =>
                  prev.map((req) => {
                    const updated = updatedRequests.find((ur) => ur.id === req.id)
                    return updated || req
                  }),
                )
              }}
              notesLoadingId={notesLoadingId}
              isLoadingRequests={isLoadingRequests}
              onDeleteRequest={handleDeleteRequest}
              onLogout={handleLogout}
            />
          )}
          {session.role === 'itManager' && (
            <ItManagerDashboard
              requests={requests}
              selectedRequestId={selectedRequestId}
              onSelectRequest={setSelectedRequestId}
              onStatusUpdate={handleStatusUpdate}
              onCostUpdate={handleCostUpdate}
              onSendEmployeeRequest={handleSendEmployeeRequest}
              noteDraft={noteDraft}
              onNoteDraftChange={setNoteDraft}
              onAddNote={handleAddNote}
              selectedRequest={selectedRequest}
              employeeDirectorySearch={employeeDirectorySearch}
              onEmployeeDirectorySearchChange={setEmployeeDirectorySearch}
              filteredEmployeeDirectory={filteredEmployeeDirectory}
              onSelectEmployeeForEdit={handleSelectEmployeeForEdit}
              onDeleteEmployee={handleDeleteEmployee}
              employeeForm={employeeForm}
              onEmployeeFormChange={handleEmployeeFormChange}
              onSaveEmployee={handleSaveEmployee}
              employeeFormFeedback={employeeFormFeedback}
              editingEmployeeId={editingEmployeeId}
              onCancelEdit={resetEmployeeForm}
              importFeedback={importFeedback}
              onImportEmployees={handleImportEmployees}
              importInputRef={importInputRef}
              onLogout={handleLogout}
            />
          )}
          {session.role === 'leadership' && (
            <LeadershipDashboard
              requests={requests}
              overview={slaOverview}
              profile={managementProfiles.leadership}
              onLogout={handleLogout}
            />
          )}
        </main>
      </div>
    </div>
  )
}

export default App
