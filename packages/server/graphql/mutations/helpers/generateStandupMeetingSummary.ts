import {getTeamPromptResponsesByMeetingId} from '../../../postgres/queries/getTeamPromptResponsesByMeetingIds'
import {TeamPromptMeeting} from '../../../postgres/types/Meeting'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import {DataLoaderWorker} from '../../graphql'
import isValid from '../../isValid'
import canAccessAI from './canAccessAI'

const generateStandupMeetingSummary = async (
  meeting: TeamPromptMeeting,
  dataLoader: DataLoaderWorker
) => {
  const team = await dataLoader.get('teams').loadNonNull(meeting.teamId)
  const isAIAvailable = await canAccessAI(team, 'standup', dataLoader)
  if (!isAIAvailable) return

  const responses = await getTeamPromptResponsesByMeetingId(meeting.id)

  const userIds = responses.map((response) => response.userId)
  const users = (await dataLoader.get('users').loadMany(userIds)).filter(isValid)

  const contentWithUsers = responses.map((response, idx) => ({
    content: response.plaintextContent,
    user: users[idx]?.preferredName ?? 'Anonymous'
  }))

  if (contentWithUsers.length === 0) return

  const manager = new OpenAIServerManager()
  const summary = await manager.getStandupSummary(contentWithUsers, meeting.meetingPrompt)
  if (!summary) return
  return summary
}

export default generateStandupMeetingSummary
