import React from 'react'
import { render, screen } from '@testing-library/react'

const mockGetServerSession = jest.fn()

jest.mock('@/lib/auth/session', () => ({ getServerSession: () => mockGetServerSession() }))
jest.mock('@/components/forms/CheckinForm', () => ({
  CheckinForm: ({ idUser, token }: { idUser: string; token: string }) => (
    <div data-testid="checkin-form" data-user={idUser} data-token={token} />
  ),
}))

import CheckinPage from '@/app/(protected)/checkin/page'

const session = { idUser: 'u1', username: 'u@test.com', token: 'tok' }

describe('CheckinPage', () => {
  beforeEach(() => mockGetServerSession.mockResolvedValue(session))

  it('renders CheckinForm with session idUser and token', async () => {
    const jsx = await CheckinPage()
    render(jsx as React.ReactElement)
    const form = screen.getByTestId('checkin-form')
    expect(form).toBeInTheDocument()
    expect(form).toHaveAttribute('data-user', 'u1')
    expect(form).toHaveAttribute('data-token', 'tok')
  })
})
