use postgrest::Postgrest;

pub fn create_client() -> Postgrest {
    Postgrest::new("https://epzrdxofotzufykimwuc.supabase.co").insert_header("apikey", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwenJkeG9mb3R6dWZ5a2ltd3VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTE4Mjg4MzQsImV4cCI6MjAwNzQwNDgzNH0.V_N0maXkqeEneoWSKVv0qj1cZbmSpHIRqBP0EUZnSgk")
}
