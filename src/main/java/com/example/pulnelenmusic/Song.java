package com.example.pulnelenmusic;

public class Song {
    private String title;
    private String artist;
    private String genre;
    private String filePath;
    private String coverPath;

    public Song(String title, String artist, String genre, String filePath, String coverPath) {
        this.title = title;
        this.artist = artist;
        this.genre = genre;
        this.filePath = filePath;
        this.coverPath = coverPath;
    }

    public String getTitle() {
        return title;
    }

    public String getArtist() {
        return artist;
    }

    public String getGenre() {
        return genre;
    }

    public String getFilePath() {
        return filePath;
    }

    public String getCoverPath() {
        return coverPath;
    }

    public String toRecord() {
        return title + "," + artist + "," + genre + "," + filePath + "," + coverPath;
    }

    public String toJSON() {
        return String.format(
                "{\"title\":\"%s\",\"artist\":\"%s\",\"genre\":\"%s\",\"filePath\":\"%s\",\"coverPath\":\"%s\"}",
                title.replace("\"", "\\\""),
                artist.replace("\"", "\\\""),
                genre.replace("\"", "\\\""),
                filePath.replace("\"", "\\\""),
                coverPath.replace("\"", "\\\"")
        );
    }

    public static Song fromRecord(String record) {
        String[] parts = record.split(",", 5);
        if (parts.length < 5) {
            return new Song(parts[0],
                    parts.length > 1 ? parts[1] : "",
                    parts.length > 2 ? parts[2] : "",
                    parts.length > 3 ? parts[3] : "static/audio/placeholder.mp4",
                    parts.length > 4 ? parts[4] : "static/img/placeholderCover.png");
        }
        return new Song(parts[0], parts[1], parts[2], parts[3], parts[4]);
    }
}

