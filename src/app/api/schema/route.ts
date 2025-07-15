import { NextResponse } from 'next/server';
import { getWeaviateClient } from '@/lib/weaviate';

export async function GET() {
  try {
    const client = getWeaviateClient();
    
    // Get all classes in the schema
    const schema = await client.schema.getter().do();
    
    // Get class-specific information with object counts
    const classesInfo = await Promise.all(
      schema.classes?.map(async (classItem: any) => {
        try {
          let objectCount = 0;
          
          // Use direct object count by fetching all objects
          const objects = await client.graphql
            .get()
            .withClassName(classItem.class)
            .withFields('title') // Get title to verify objects
            .do();
          
          objectCount = objects.data?.Get?.[classItem.class]?.length || 0;
          
          console.log(`Raw query result for ${classItem.class}:`, JSON.stringify(objects.data?.Get?.[classItem.class], null, 2));
          console.log(`Object count for ${classItem.class}:`, objectCount);
          
          return {
            ...classItem,
            objectCount
          };
        } catch (error) {
          console.error(`Error getting count for class ${classItem.class}:`, error);
          return {
            ...classItem,
            objectCount: 0
          };
        }
      }) || []
    );
    
    return NextResponse.json({
      success: true,
      schema: {
        ...schema,
        classes: classesInfo
      }
    });
  } catch (error) {
    console.error('Schema fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch schema' },
      { status: 500 }
    );
  }
} 