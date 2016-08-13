import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLString,
  GraphQLBoolean,
  GraphQLInputObjectType,
  GraphQLFloat
} from 'graphql';
import GraphQLISO8601Type from 'graphql-custom-datetype';

export const AgendaItem = new GraphQLObjectType({
  name: 'AgendaItem',
  description: 'A request placeholder that will likely turn into 1 or more tasks',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique agenda item id'},
    content: {type: new GraphQLNonNull(GraphQLString), description: 'The body of the agenda item'},
    teamId: {type: new GraphQLNonNull(GraphQLID), description: 'The team for this agenda item'},
    teamMemberId: {type: new GraphQLNonNull(GraphQLID), description: 'The teamMemberId that created this agenda item'},
    createdAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the placeholder was created'
    },
    isComplete: {
      type: GraphQLBoolean,
      description: 'true if the agenda item has been addressed in a meeting (will have a strikethrough or similar)'
    },
    isActive: {
      type: GraphQLBoolean,
      description: 'true until the agenda item has been marked isComplete and the meeting has ended'
    },
    sort: {
      type: GraphQLFloat,
      description: 'The sort order of the agenda item in the list'
    }
  })
});

export const CreateAgendaItemInput = new GraphQLInputObjectType({
  name: 'CreateAgendaItemInput',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique agenda item ID'},
    content: {type: new GraphQLNonNull(GraphQLString), description: 'The content of the agenda item'},
    teamMemberId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The team member ID of the person creating the agenda item'
    },
    sort: {
      type: GraphQLFloat,
      description: 'The sort order of the agenda item in the list'
    }
  })
});

export const UpdateAgendaItemInput = new GraphQLInputObjectType({
  name: 'UpdateAgendaItemInput',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique agenda item ID, composed of a teamId::shortid'},
    content: {type: GraphQLString, description: 'The content of the agenda item'},
    isComplete: {
      type: GraphQLBoolean,
      description: 'true if the agenda item has been addressed in a meeting (will have a strikethrough or similar)'
    },
    isActive: {
      type: GraphQLBoolean,
      description: 'true until the agenda item has been marked isComplete and the meeting has ended'
    },
    sort: {
      type: GraphQLFloat,
      description: 'The sort order of the agenda item in the list'
    }
  })
});
