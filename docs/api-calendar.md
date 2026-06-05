# Availability calendar endpoints

## public endpoint (No Authorization)

### Get room availability calendar

```text
GET /api/rooms/:roomId/availability-calendar?start_date=&end_date=
```

params:
start_date (>=Now())
end_date

success response:

```json
{
  "result": true,
  "status": 200,
  "data": {
    "room_id": "9",
    "available_dates": [
      "2026-06-20",
      "2026-06-21",
      "2026-06-22",
      "2026-06-23",
      "2026-06-24",
      "2026-06-25",
      "2026-06-26",
      "2026-06-27",
      "2026-06-28",
      "2026-06-29"
    ],
    "unavailable_dates": [
      "2026-06-05",
      "2026-06-06",
      "2026-06-07",
      "2026-06-08",
      "2026-06-09",
      "2026-06-10",
      "2026-06-11",
      "2026-06-12",
      "2026-06-13",
      "2026-06-14",
      "2026-06-15",
      "2026-06-16",
      "2026-06-17",
      "2026-06-18",
      "2026-06-19"
    ]
  }
}
```

### Get property availability calendar

```text
GET /api/properties/:propertyId/availability-calendar?start_date=&end_date=
```

params:
start_date (>=Now())
end_date

success response:

```json
{
  "result": true,
  "status": 200,
  "data": [
    {
      "room_id": 9,
      "check_in_date": "2026-06-04T17:00:00.000Z",
      "check_out_date": "2026-06-19T17:00:00.000Z"
    },
    {
      "room_id": 9,
      "check_in_date": "2026-06-07T17:00:00.000Z",
      "check_out_date": "2026-06-14T17:00:00.000Z"
    }
  ]
}
```

## Owner endpoints(Authorization: required)

### Get Owner property availability calendar

```text
GET /api/owner/properties/:propertyId/availability-calendar?start_date=&end_date=
```

params:
start_date (>=Now())
end_date

success response:

```json
{
  "result": true,
  "status": 200,
  "data": [
    {
      "room_id": 9,
      "check_in_date": "2026-06-04T17:00:00.000Z",
      "check_out_date": "2026-06-19T17:00:00.000Z"
    },
    {
      "room_id": 9,
      "check_in_date": "2026-06-07T17:00:00.000Z",
      "check_out_date": "2026-06-14T17:00:00.000Z"
    }
  ]
}
```

### Get owneer room availability calendar

```text
GET /api/owner/rooms/:roomId/availability-calendar?start_date=&end_date=
```

params:
start_date (>=Now())
end_date

success response:

```json
{
  "result": true,
  "status": 200,
  "data": {
    "room_id": "9",
    "available_dates": [
      "2026-06-20",
      "2026-06-21",
      "2026-06-22",
      "2026-06-23",
      "2026-06-24",
      "2026-06-25",
      "2026-06-26",
      "2026-06-27",
      "2026-06-28",
      "2026-06-29"
    ],
    "unavailable_dates": [
      "2026-06-05",
      "2026-06-06",
      "2026-06-07",
      "2026-06-08",
      "2026-06-09",
      "2026-06-10",
      "2026-06-11",
      "2026-06-12",
      "2026-06-13",
      "2026-06-14",
      "2026-06-15",
      "2026-06-16",
      "2026-06-17",
      "2026-06-18",
      "2026-06-19"
    ]
  }
}
```
