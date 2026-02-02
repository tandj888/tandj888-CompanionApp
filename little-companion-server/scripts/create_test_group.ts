
import { AppDataSource } from "../src/data-source";
import { User } from "../src/entity/User";
import { Group } from "../src/entity/Group";
import { GroupMember } from "../src/entity/GroupMember";

async function createTestGroup() {
    try {
        await AppDataSource.initialize();
        
        const userId = "user-1769767933516"; // 谭笑笑
        const groupId = `group-test-${Date.now()}`;
        
        console.log(`Creating test group for user: ${userId}`);

        // 1. Create Group
        const groupRepository = AppDataSource.getRepository(Group);
        const group = new Group();
        group.id = groupId;
        group.name = "Database Test Group";
        group.description = "Created via script to verify persistence";
        group.maxMembers = 5;
        group.status = "active";
        group.leaderId = userId;
        group.inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        group.createTime = Date.now();
        group.inviteExpires = Date.now() + 7 * 24 * 60 * 60 * 1000;
        
        await groupRepository.save(group);
        console.log(`Group created: ${group.id}`);

        // 2. Create Member
        const memberRepository = AppDataSource.getRepository(GroupMember);
        const member = new GroupMember();
        member.id = `mem-${group.id}-${userId}`;
        member.groupId = group.id;
        member.userId = userId;
        member.hasCheckedInToday = false;
        member.streak = 0;
        
        await memberRepository.save(member);
        console.log(`Member created: ${member.id}`);

        console.log("Test data creation successful!");
        process.exit(0);
    } catch (error) {
        console.error("Error creating test data:", error);
        process.exit(1);
    }
}

createTestGroup();
