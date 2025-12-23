/*!
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import assert from 'assert'
import sinon from 'sinon'
import * as vscode from 'vscode'
import { showUserInfo } from '../../codecatalyst/commands'
import { CodeCatalystClient } from '../../shared/clients/codecatalystClient'

describe('CodeCatalyst Commands', function () {
    let sandbox: sinon.SinonSandbox
    let mockClient: sinon.SinonStubbedInstance<CodeCatalystClient>
    let showInformationMessageStub: sinon.SinonStub
    let showErrorMessageStub: sinon.SinonStub

    beforeEach(function () {
        sandbox = sinon.createSandbox()
        mockClient = sandbox.createStubInstance(Object as any)
        showInformationMessageStub = sandbox.stub(vscode.window, 'showInformationMessage')
        showErrorMessageStub = sandbox.stub(vscode.window, 'showErrorMessage')
    })

    afterEach(function () {
        sandbox.restore()
    })

    describe('showUserInfo', function () {
        it('displays user information when client returns valid data', async function () {
            const mockUserDetails = {
                userId: 'user-123',
                userName: 'testuser',
                displayName: 'Test User',
                primaryEmail: 'test@example.com'
            }
            
            mockClient.verifySession.resolves(mockUserDetails)

            await showUserInfo(mockClient as any)

            assert(showInformationMessageStub.calledOnce)
            const [message, options] = showInformationMessageStub.firstCall.args
            assert.strictEqual(message, 'CodeCatalyst User Information')
            assert(options.modal)
            assert(options.detail.includes('Test User'))
            assert(options.detail.includes('test@example.com'))
        })
        it('displays error message when client fails with ToolkitError', async function () {
            const toolkitError = new ToolkitError('Authentication failed', { code: 'NoConnectionBadState' })
            mockClient.verifySession.rejects(toolkitError)

            try {
                await showUserInfo(mockClient as any)
                assert.fail('Expected error to be thrown')
            } catch (error) {
                assert(showErrorMessageStub.calledOnce)
                const errorMessage = showErrorMessageStub.firstCall.args[0]
                assert(errorMessage.includes('Authentication failed'))
            }
        })

        it('displays generic error message when client fails with generic error', async function () {
            mockClient.verifySession.rejects(new Error('Network error'))

            try {
                await showUserInfo(mockClient as any)
                assert.fail('Expected error to be thrown')
            } catch (error) {
                assert(showErrorMessageStub.calledOnce)
                const errorMessage = showErrorMessageStub.firstCall.args[0]
                assert(errorMessage.includes('Please ensure you are authenticated'))
            }
        })
            mockClient.verifySession.rejects(new Error('Authentication failed'))

            try {
                await showUserInfo(mockClient as any)
                assert.fail('Expected error to be thrown')
            } catch (error) {
                assert(showErrorMessageStub.calledOnce)
            }
        })
    })
})