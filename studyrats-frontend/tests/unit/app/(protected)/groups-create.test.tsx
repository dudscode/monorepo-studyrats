import React from 'react'
import { render, screen } from '@testing-library/react'

const mockGetServerSession = jest.fn()

jest.mock('@/lib/auth/session', () => ({ getServerSession: () => mockGetServerSession() }))
jest.mock('@/components/forms/GroupCreateForm', () => ({
  GroupCreateForm: ({ idUser, token }: { idUser: string; token: string }) => (
    <div data-testid="group-create-form" data-user={idUser} data-token={token} />
  ),
}))

import GroupCreatePage from '@/app/(protected)/groups/create/page'

const session = { idUser: 'u1', username: 'u@test.com', token: 'tok' }

describe('GroupCreatePage', () => {
  beforeEach(() => mockGetServerSession.mockResolvedValue(session))

  it('renders GroupCreateForm with session idUser and token', async () => {
    const jsx = await GroupCreatePage()
    render(jsx as React.ReactElement)
    const form = screen.getByTestId('group-create-form')
    expect(form).toBeInTheDocument()
    expect(form).toHaveAttribute('data-user', 'u1')
    expect(form).toHaveAttribute('data-token', 'tok')
  })
})
