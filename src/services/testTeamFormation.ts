/**
 * Test the team formation flow end-to-end
 * 
 * Prerequisites:
 * 1. Backend server running on port 5000
 * 2. User logged in (JWT token in localStorage)
 * 3. At least 4 eligible students in database
 * 
 * Run this in browser console on the team formation page
 */

import { getAllStrategiesComparison } from './teamFormation';

async function testTeamFormation() {
    console.log('🧪 Testing Team Formation Implementation');
    console.log('=' .repeat(50));
    
    try {
        // Check if user is authenticated
        const token = localStorage.getItem('accessToken');
        if (!token) {
            console.error('❌ No auth token found. Please log in first.');
            return;
        }
        console.log('✅ Auth token found');
        
        // Test with team size of 4
        const teamSize = 4;
        console.log(`\n📊 Generating teams with size: ${teamSize}`);
        
        const result = await getAllStrategiesComparison(teamSize, 'faculty_test');
        
        console.log('\n✅ Team Formation Results:');
        console.log(`  - Balanced teams: ${result.balanced.teams.length}`);
        console.log(`  - Complementary teams: ${result.complementary.teams.length}`);
        console.log(`  - Role-based teams: ${result['role-based'].teams.length}`);
        
        console.log('\n📋 Balanced Strategy Details:');
        result.balanced.teams.forEach((team, idx) => {
            console.log(`  Team ${idx + 1}: ${team.members.length} members`);
            team.members.forEach(m => {
                console.log(`    - Student ${m.studentId} (${m.role})`);
            });
        });
        
        console.log('\n🎉 Team formation test completed successfully!');
        
    } catch (error) {
        console.error('❌ Team formation test failed:', error);
        if (error instanceof Error) {
            console.error('Error details:', error.message);
            if (error.stack) {
                console.error('Stack trace:', error.stack);
            }
        }
    }
}

// Run the test
testTeamFormation();
