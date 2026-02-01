import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v10'

const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN!
const GUILD_ID = process.env.DISCORD_GUILD_ID!
const ROLE_ID = process.env.DISCORD_PREMIUM_ROLE_ID!

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN)

// Add user to Discord server and assign role
export async function addUserToDiscord(userId: string, accessToken: string) {
  try {
    // Add user to guild using their access token
    await rest.put(
      Routes.guildMember(GUILD_ID, userId),
      {
        body: {
          access_token: accessToken,
        },
      }
    )

    // Assign premium role
    await addRoleToMember(userId, ROLE_ID)

    return { success: true }
  } catch (error) {
    console.error('Failed to add user to Discord:', error)
    return { success: false, error }
  }
}

export async function addRoleToMember(userId: string, roleId: string = ROLE_ID) {
  try {
    await rest.put(
      Routes.guildMemberRole(GUILD_ID, userId, roleId)
    )
    return { success: true }
  } catch (error) {
    console.error('Failed to add role:', error)
    return { success: false, error }
  }
}

export async function removeRoleFromMember(userId: string, roleId: string = ROLE_ID) {
  try {
    await rest.delete(
      Routes.guildMemberRole(GUILD_ID, userId, roleId)
    )
    return { success: true }
  } catch (error) {
    console.error('Failed to remove role:', error)
    return { success: false, error }
  }
}

export async function getMemberRoles(userId: string) {
  try {
    const member = await rest.get(
      Routes.guildMember(GUILD_ID, userId)
    ) as { roles: string[] }
    return { success: true, roles: member.roles }
  } catch (error) {
    console.error('Failed to get member:', error)
    return { success: false, error }
  }
}

export async function kickMember(userId: string, reason?: string) {
  try {
    await rest.delete(
      Routes.guildMember(GUILD_ID, userId),
      { reason }
    )
    return { success: true }
  } catch (error) {
    console.error('Failed to kick member:', error)
    return { success: false, error }
  }
}