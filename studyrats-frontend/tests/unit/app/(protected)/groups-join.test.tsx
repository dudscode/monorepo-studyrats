import React from 'react'
import { render, screen } from '@testing-library/react'

const mockGetServerSession = jest.fn()

jest.mock('@/lib/auth/session', () => ({ getServerSession: () => mockGetServerSession() }))
jest.mock('@/components/forms/GroupJoinForm', () => ({
  GroupJoinForm: ({ idUser, token }: { idUser: string; token: string }) => (
    <div data-testid="group-join-form" data-user={idUser} data-token={token} />
  ),
}))

import GroupJoinPage from '@/app/(protected)/groups/join/page'

const session = { idUser: 'u1', username: 'u@test.com', token: 'tok' }

describe('GroupJoinPage', () => {
  beforeEach(() => mockGetServerSession.mockResolvedValue(session))

  it('renders GroupJoinForm with session idUser and token', async () => {
    const jsx = await GroupJoinPage()
    render(jsx as React.ReactElement)
    const form = screen.getByTestId('group-join-form')
    expect(form).toBeInTheDocument()
    expect(form).toHaveAttribute('data-user', 'u1')
    expect(form).toHaveAttribute('data-token', 'tok')
  })
})
