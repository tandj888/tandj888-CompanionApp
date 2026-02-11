// import fetch from 'node-fetch';
import { AppDataSource } from './src/data-source';
import { GroupMember } from './src/entity/GroupMember';

async function run() {
    try {
        await AppDataSource.initialize();
        const memberRepo = AppDataSource.getRepository(GroupMember);
        
        // Find a valid member to test
        const members = await memberRepo.find({ 
            relations: ["group", "user"],
            // take: 1 // REMOVE THIS to avoid SQL error
        });
        const member = members[0];
        
        if (!member) {
            console.log("No member found for testing");
            return;
        }

        const users = await AppDataSource.getRepository("User").find(); // Fetch all users to avoid SQL OFFSET error
        if (users.length < 2) {
             console.log("Not enough users to test cross-user interaction");
             // return; 
        }
        const otherUser = users.find(u => u.id !== member.userId) || users[0];

        const groupId = member.groupId;
        const memberId = member.userId;
        const likerId = otherUser.id; // Cross-user like

        console.log(`Testing Like API for Group: ${groupId}, Member: ${memberId}, Liker: ${likerId}`);

        // Test Like API
        const response = await fetch(`http://localhost:3000/api/groups/${groupId}/members/${memberId}/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ likerId })
        });

        console.log(`Like Response Status: ${response.status}`);
        const data = await response.json();
        console.log(`Like Response Data:`, data);

        // Test Remind API
        console.log(`Testing Remind API...`);
        const responseRemind = await fetch(`http://localhost:3000/api/groups/${groupId}/members/${memberId}/remind`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reminderId: likerId })
        });
        
        console.log(`Remind Response Status: ${responseRemind.status}`);
        const dataRemind = await responseRemind.json();
        console.log(`Remind Response Data:`, dataRemind);

    } catch (error) {
        console.error("Test Error:", error);
    } finally {
        process.exit(0);
    }
}

run();
