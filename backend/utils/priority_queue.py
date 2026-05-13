import heapq
import time

class EmergencyQueue:
    """
    Module 2: Hospital Priority Queue System
    Uses a Heap (Priority Queue) to manage patient priority.
    """
    def __init__(self):
        self._queue = []  # Internal heap list
        self._entry_count = 0 # To handle tie-breaking for same severity

    def add_patient(self, patient_id, name, severity_score):
        """
        Pushes a patient into the heap.
        Python's heapq is a min-heap, so we use -severity_score for max-heap behavior.
        """
        # (Negative Priority, Entry Count, Data)
        # Entry count ensures that if scores are equal, the person who came first stays first (FIFO).
        heapq.heappush(self._queue, (-severity_score, self._entry_count, {
            "id": patient_id,
            "name": name,
            "score": severity_score,
            "arrival_time": time.strftime('%H:%M:%S')
        }))
        self._entry_count += 1

    def get_next_patient(self):
        """Removes and returns the highest priority patient."""
        if self._queue:
            return heapq.heappop(self._queue)[2]
        return None

    def peek_queue(self):
        """Returns the list of patients sorted by priority (for dashboard)."""
        # We sort the list slice to avoid modifying the actual heap
        sorted_q = sorted(self._queue)
        return [item[2] for item in sorted_q]
