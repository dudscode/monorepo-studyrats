import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockCreateGroup = jest.fn()
const mockPush = jest.fn()

jest.mock('@/lib/api/groups', () => ({ createGroup: (...a: unknown[]) => mockCreateGroup(...a) }))
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: mockPush }) }))

import { GroupCreateForm } from '@/components/forms/GroupCreateForm'

const props = { idUser: 'u1', token: 'tok' }

describe('GroupCreateForm', () => {
  beforeEach(() => {
    mockCreateGroup.mockReset()
    mockPush.mockReset()
  })

  it('renders name field (required) and description field (optional)', () => {
    render(<GroupCreateForm {...props} />)
    expect(screen.getByLabelText(/nome do grupo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /criar grupo/i })).toBeInTheDocument()
  })

  it('calls createGroup on submit and redirects to /dashboard on success', async () => {
    mockCreateGroup.mockResolvedValue({ id: 'g1', name: 'React' })
    render(<GroupCreateForm {...props} />)
    await userEvent.type(screen.getByLabelText(/nome do grupo/i), 'React')
    await userEvent.click(screen.getByRole('button', { name: /criar grupo/i }))
    await waitFor(() => {
      expect(mockCreateGroup).toHaveBeenCalledWith('u1', expect.objectContaining({ name: 'React' }), 'tok')
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('disables button while in-flight', async () => {
    let resolve: () => void
    mockCreateGroup.mockReturnValue(new Promise((r) => { resolve = () => r({ id: 'g1' }) }))
    render(<GroupCreateForm {...props} />)
    await userEvent.type(screen.getByLabelText(/nome do grupo/i), 'React')
    await userEvent.click(screen.getByRole('button', { name: /criar grupo/i }))
    expect(screen.getByRole('button', { name: /criar grupo/i })).toBeDisabled()
    resolve!()
  })
})
