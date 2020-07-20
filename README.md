# Reminder Discord

A Discord bot that works as a reminder. This is an attempt for me to learn how to use a better design pattern to avoid procedural switch-case and understanding how dependency injection framework in TS works.

## Specification

### Create a job

> r!create

Options

| Required (working) | Option                    | Description                                                                                                                                                                               |
| ------------------ | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Yes (yes)          | `-m '<message>'`          | Use a message                                                                                                                                                                             |
| Yes (yes)          | `-t <time>`               | Delta time of when it needs to be executed compared to time = now. Formatting should follow [time formatting](#time-formatting)                                                           |
| No (no)            | `-c, --chan <channel_id>` | Channel id of the channel that you want the bot to put message. This channel must be bot-accessible. If this is not supplied, this defaults to the channel where the command is executed. |

## Time formatting

The time formatting of this bot follows this regex:

```ts
/(?:(\d+)d)?(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/;
```

For example, if you want to create a reminder that gets executed in 5 hours and 20 minutes, use `-t 5h20m`.

## To do

- Allow user to use message on a different channel
- Allow user to reschedule their time
