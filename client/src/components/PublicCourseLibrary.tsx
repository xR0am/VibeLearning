import { useState, useEffect } from "react";
import { CourseWithTags } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CodeLoader } from "@/components/ui/code-loader";
import ComplexityBadge from "./ComplexityBadge";
import { computeCourseComplexity } from "@/lib/courseUtils";
import { 
  Globe, 
  Code, 
  Layers, 
  Search, 
  Tag,
  FileText,
  BookOpen
} from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

export default function PublicCourseLibrary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [uniqueTags, setUniqueTags] = useState<string[]>([]);
  
  // Fetch public courses
  const { data: courses = [], isLoading, error } = useQuery<CourseWithTags[]>({
    queryKey: ["/api/courses"],
    retry: 1,
  });
  
  // Extract unique tags from all courses
  useEffect(() => {
    if (courses.length > 0) {
      const allTags = courses.flatMap((course: CourseWithTags) => course.tags || []);
      const uniqueTagSet = new Set<string>(allTags as string[]);
      setUniqueTags(Array.from(uniqueTagSet));
    }
  }, [courses]);
  
  // Filter courses based on search query and selected tag
  const filteredCourses = courses.filter((course: CourseWithTags) => {
    // Filter by search query
    const matchesSearch = 
      !searchQuery || 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.repoUrl && course.repoUrl.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (course.context && course.context.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Filter by selected tag
    const matchesTag = !selectedTag || (course.tags && course.tags.includes(selectedTag));
    
    // Only show public courses
    const isPublic = course.isPublic;
    
    return matchesSearch && matchesTag && isPublic;
  });
  
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedTag(null);
  };
  
  const toggleTag = (tag: string) => {
    if (selectedTag === tag) {
      setSelectedTag(null);
    } else {
      setSelectedTag(tag);
    }
  };
  
  return (
    <Card className="border shadow-lg card-shadow mb-8">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          Public Course Library
        </CardTitle>
        
        {/* Search & Filter UI */}
        <div className="mt-4 space-y-4">
          <div className="flex gap-2 flex-col sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search courses by title, repository, or context..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {selectedTag && (
              <Button variant="outline" size="sm" onClick={resetFilters} className="whitespace-nowrap">
                Clear Filters
              </Button>
            )}
          </div>
          
          {uniqueTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center mr-1">
                <Tag className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Filter:</span>
              </div>
              {uniqueTags.map((tag) => (
                <Badge 
                  key={tag}
                  variant={selectedTag === tag ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer text-xs",
                    selectedTag === tag 
                      ? "bg-primary" 
                      : "hover:bg-primary/10"
                  )}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <CodeLoader variant="code" size="lg" text="Loading public courses..." />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-destructive">Error loading courses. Please try again later.</p>
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredCourses.map((course: CourseWithTags) => (
              <Link key={course.id} href={`/course/${course.id}`}>
                <Card className="border overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col">
                  <CardHeader className="p-4 pb-3 border-b">
                    <CardTitle className="text-base font-medium line-clamp-2">{course.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1 truncate flex items-center gap-1">
                      <Code className="h-3.5 w-3.5 flex-shrink-0" />
                      {course.repoUrl}
                    </p>
                  </CardHeader>
                  <CardContent className="p-4 pt-3 flex-1">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <Badge variant="outline" className="bg-purple-50/30 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-xs">
                        <Layers className="mr-1 h-3 w-3 flex-shrink-0" />
                        {course.modelUsed}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <FileText className="mr-1 h-3 w-3 flex-shrink-0" />
                        {course.context}
                      </Badge>
                    </div>
                    {course.tags && course.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {course.tags.map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="p-4 pt-2 border-t mt-auto">
                    <Button variant="default" size="sm" className="w-full">
                      <BookOpen className="mr-2 h-4 w-4" />
                      View Course
                    </Button>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg bg-muted/20">
            <p className="text-muted-foreground">No courses match your search criteria.</p>
            {(searchQuery || selectedTag) && (
              <Button variant="ghost" size="sm" onClick={resetFilters} className="mt-2">
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </CardContent>
      
      {filteredCourses.length > 0 && (
        <CardFooter className="py-4 border-t">
          <p className="text-sm text-muted-foreground">
            Showing {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
            {selectedTag && ` with tag "${selectedTag}"`}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </CardFooter>
      )}
    </Card>
  );
}