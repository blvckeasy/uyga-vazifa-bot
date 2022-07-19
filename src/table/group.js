import { db_fetch, db_fetchAll } from "../utils/pg.js";

const getAllGroups = async (user_id) => {
  try {
    const all_groups = await db_fetchAll(`
      SELECT * FROM groups
        WHERE group_deleted_at is null;
    `);

    const user_follow_groups = [];

    if (user_id) {
      await Promise.all(all_groups.forEach(async (group) => {
        try {
          await getChatMember(group.group_id, user_id);
          user_follow_groups.push(group);
        } catch (error) { null; }
      }));
      return { data: user_follow_groups };
    }

    return { data: all_groups };
  } catch (error) {
    console.error('table -> group.js -> getAllGroup:', error.message);
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

getUserFollowingGroup(1881954930);


export {
  getAllGroups,
};