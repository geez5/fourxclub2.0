import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v10'
import { config } from '../config/env.js'

const rest = new REST({ version: '10' }).setToken(config.discord.botToken)

// Add user to Discord server and assign role
export async function addUserToDiscord(userId: string, accessToken: string) {
    try {
        // Add user to guild using their access token
        await rest.put(Routes.guildMember(config.discord.guildId, userId), {
            body: {
                access_token: accessToken,
            },
        })

        // Assign premium role
        await addRoleToMember(userId)

        return { success: true }
    } catch (error) {
        console.error('Failed to add user to Discord:', error)
        return { success: false, error }
    }
}

export async function addRoleToMember(userId: string, roleId?: string) {
    try {
        await rest.put(
            Routes.guildMemberRole(config.discord.guildId, userId, roleId || config.discord.premiumRoleId)
        )
        return { success: true }
    } catch (error) {
        console.error('Failed to add role:', error)
        return { success: false, error }
    }
}

export async function removeRoleFromMember(userId: string, roleId?: string) {
    try {
        await rest.delete(
            Routes.guildMemberRole(config.discord.guildId, userId, roleId || config.discord.premiumRoleId)
        )
        return { success: true }
    } catch (error) {
        console.error('Failed to remove role:', error)
        return { success: false, error }
    }
}

export async function getMemberRoles(userId: string) {
    try {
        const member = (await rest.get(Routes.guildMember(config.discord.guildId, userId))) as {
            roles: string[]
        }
        return { success: true, roles: member.roles }
    } catch (error) {
        console.error('Failed to get member:', error)
        return { success: false, error }
    }
}
