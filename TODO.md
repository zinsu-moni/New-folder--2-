# TODO

## Music Streaming Revamp
- [ ] Audit `backend/app/routers/streams.py` to confirm available endpoints and required adjustments for audio-based earnings.
- [ ] Update audio models (`backend/app/models/stream.py`) to store metadata required by the new workflow (e.g., media URLs, duration, reward amount).
- [ ] Implement backend logic to create/list audio tasks comparable to regular tasks (consider new endpoints or extend existing ones).
- [ ] Build frontend player workflow in `streaming.html` and related JS to mirror the task-taking flow with audio playback state tracking.
- [ ] Ensure reward claiming integrates with existing transaction/account balance logic; add tests covering the new flow.

## Profile Image Upload
- [ ] Decide on storage strategy (local filesystem vs. cloud) and document constraints.
- [ ] Add backend endpoint to accept profile image uploads and persist path/reference (likely in `backend/app/routers/users.py`).
- [ ] Update user model/schema to include avatar field; run migrations or scripts as needed.
- [ ] Extend `profile.html` and related JS to allow selecting, previewing, and uploading images, including client-side validation.
- [ ] Provide fallback/default avatar handling and add tests for upload success/failure cases.
