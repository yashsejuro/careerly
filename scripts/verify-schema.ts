import { profileSchema } from '../src/lib/schemas';

async function main() {
  console.log('Running schema verification...');

  const validData = {
    degree: 'B.Tech',
    year: '3rd',
    skills: 'React, Node',
    interests: 'AI',
    goalCareer: 'Engineer'
  };

  const invalidData = {
    degree: '',
    year: '',
    skills: '',
    interests: '',
    goalCareer: ''
  };

  const missingData = {};

  // Test Valid
  const validResult = profileSchema.safeParse(validData);
  if (validResult.success) {
    console.log('✅ Valid data passed');
  } else {
    console.error('❌ Valid data failed:', validResult.error);
    process.exit(1);
  }

  // Test Invalid (Empty strings)
  const invalidResult = profileSchema.safeParse(invalidData);
  if (!invalidResult.success) {
    console.log('✅ Invalid data (empty strings) correctly rejected');
    // Verify specific error messages
    const errors = invalidResult.error.flatten().fieldErrors;
    if (errors.degree && errors.year && errors.skills && errors.interests && errors.goalCareer) {
        console.log('✅ All fields have error messages');
    } else {
        console.error('❌ Missing error messages for some fields', errors);
        process.exit(1);
    }
  } else {
    console.error('❌ Invalid data passed (should fail)');
    process.exit(1);
  }

    // Test Missing Keys
  const missingResult = profileSchema.safeParse(missingData);
  if (!missingResult.success) {
      console.log('✅ Missing data correctly rejected');
  } else {
      console.error('❌ Missing data passed (should fail)');
      process.exit(1);
  }

  console.log('🎉 All schema verifications passed!');
}

main().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
