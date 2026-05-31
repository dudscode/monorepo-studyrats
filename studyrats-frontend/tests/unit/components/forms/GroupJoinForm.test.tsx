import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockJoinGroup = jest.fn()
const mockPush = jest.fn()

jest.mock('@/lib/api/groups', () => ({ joinGroup: (...a: unknown[]) => mockJoinGroup(...a) }))
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: mockPush }) }))

import { GroupJoinForm } from '@/components/forms/GroupJoinForm'

const props = { idUser: 'u1', token: 'tok' }

describe('GroupJoinForm', () => {
  beforeEach(() => {
    mockJoinGroup.mockReset()
    mockPush.mockReset()
  })

  it('renders groupId field and submit button', () => {
    render(<GroupJoinForm {...props} />)
    expect(screen.getByLabelText(/id do grupo/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /entrar no grupo/i })).toBeInTheDocument()
  })

  it('redirects to /dashboard on success', async () => {
    mockJoinGroup.mockResolvedValue({ id: 'g1' })
    render(<GroupJoinForm {...props} />)
    await userEvent.type(screen.getByLabelText(/id do grupo/i), 'g1')
    await userEvent.click(screen.getByRole('button', { name: /entrar no grupo/i }))
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/dashboard'))
  })

  it('shows "Grupo não encontrado" error on GROUP_NOT_FOUND', async () => {
    mockJoinGroup.mockRejectedValue(new Error('GROUP_NOT_FOUND'))
    render(<GroupJoinForm {...props} />)
    await userEvent.type(screen.getByLabelText(/id do grupo/i), 'badid')
    await userEvent.click(screen.getByRole('button', { name: /entrar no grupo/i }))
    await waitFor(() =>
      expect(screen.getByText(/grupo não encontrado ou erro ao entrar/i)).toBeInTheDocument()
    )
  })

  it('shows same error message on any other error', async () => {
    mockJoinGroup.mockRejectedValue(new Error('network'))
    render(<GroupJoinForm {...props} />)
    await userEvent.type(screen.getByLabelText(/id do grupo/i), 'g1')
    await userEvent.click(screen.getByRole('button', { name: /entrar no grupo/i }))
    await waitFor(() =>
      expect(screen.getByText(/grupo não encontrado ou erro ao entrar/i)).toBeInTheDocument()
    )
  })
})
