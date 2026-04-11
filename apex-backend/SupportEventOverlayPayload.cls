global class SupportEventOverlayPayload {

    public String type;
    public List<SupportEventOverlayDTO> events;

    public SupportEventOverlayPayload(
        List<SupportEventOverlayDTO> events
    ) {
        this.type = 'events';
        this.events = events;
    }
}