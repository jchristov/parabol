import {GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import connectionDefinitions from '../connectionDefinitions'
import {GQLContext} from '../graphql'
import ReflectPrompt from './ReflectPrompt'
import SharableTemplate, {sharableTemplateFields} from './SharableTemplate'

const ReflectTemplate = new GraphQLObjectType<any, GQLContext>({
  name: 'ReflectTemplate',
  description: 'The team-specific templates for the reflection prompts',
  interfaces: () => [SharableTemplate],
  fields: () => ({
    ...sharableTemplateFields(),
    prompts: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ReflectPrompt))),
      description: 'The prompts that are part of this template',
      resolve: async ({id: templateId}, _args, {dataLoader}) => {
        const prompts = await dataLoader.get('reflectPromptsByTemplateId').load(templateId)
        prompts.sort((a, b) => (a.sortOrder < b.sortOrder ? -1 : 1))
        return prompts
      }
    }
  })
})

const {connectionType, edgeType} = connectionDefinitions({
  name: ReflectTemplate.name,
  nodeType: ReflectTemplate
})

export const ReflectTemplateConnection = connectionType
export const ReflectTemplateEdge = edgeType
export default ReflectTemplate
