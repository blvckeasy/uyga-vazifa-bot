import { db_fetch, db_fetchAll } from "../utils/pg.js";

const getAllGroups = async (user_id, bot) => {
  try {
    const user_follow_groups = [];
    const groups = await db_fetchAll(`
      SELECT * FROM groups
        WHERE group_deleted_at is null;
    `);

    if (user_id) {
      for (const group of groups) {
        try {
          await bot.getChatMember(group.group_id, user_id);
          user_follow_groups.push(group);
        } catch (error) { null; }
      }
      return { data: user_follow_groups };
    }

    return { data: groups };
  } catch (error) {
    console.error('table -> group.js -> getAllGroup:', error.message);
    return { error };
  }
};

const getGroup = async (group_id) => {
  try {
    const data = await db_fetch(`
      select * from groups where 
        group_id = $1 and group_deleted_at is null; 
    `, group_id);
    return { data };
  } catch (error) {
    return { error };
  }
};

const getUserFollowingGroup = async (bot, user_id) => {
  try {
    const { data: groups } = await getAllGroups();
    const groups_id = groups.map(obj => obj.group_id);
    const user_groups = [];

    groups_id.map(async group_id => {
      try {
        const data = {
          [group_id]: await bot.getChatMember(group_id, user_id),
        };
        user_groups.push(await bot.getChatMember(group_id, user_id));
        return data;
      } catch (error) {
        return {
          [group_id]: undefined,
        };
      }
    });
  } catch (error) {
    console.error('table -> group.js -> getUserFollowingGroup:', error.message);
    return { error };
  }
};


export {
  getAllGroups,
  getGroup,
};