import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Montserrat', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: ${props => props.theme?.colors?.background || '#ffffff'};
    color: ${props => props.theme?.colors?.text || '#000000'};
    overflow-x: hidden;
    min-height: 100vh;
  }

  .leaflet-container {
    width: 100%;
    height: 100%;
    z-index: 1;
  }

  .leaflet-div-icon {
    background: none !important;
    border: none !important;
  }

  .marker-default {
    width: 30px !important;
    height: 30px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;

    > div {
      width: 12px !important;
      height: 12px !important;
      background-color: ${props => props.theme?.colors?.primary || '#3388ff'} !important;
      border: 2px solid #fff !important;
      border-radius: 50% !important;
      box-shadow: 0 0 4px rgba(0, 0, 0, 0.3) !important;
      transition: all 0.3s ease !important;
    }

    &:hover > div {
      transform: scale(1.2);
    }
  }

  .marker-active {
    width: 30px !important;
    height: 40px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;

    > div {
      width: 30px !important;
      height: 40px !important;
      background-image: url('/data/images/mark.svg') !important;
      background-size: contain !important;
      background-repeat: no-repeat !important;
      background-position: center !important;
      transition: all 0.3s ease !important;
    }
  }

  .marker-cluster {
    background: none !important;
    border: none !important;

    .cluster-icon {
      background-color: ${props => props.theme?.colors?.primary || '#3388ff'};
      color: white;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: bold;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
      transition: all 0.2s ease;
      will-change: transform;
      border: 2px solid white;
    }

    &:hover .cluster-icon {
      transform: scale(1.1);
      background-color: ${props => props.theme?.colors?.hover || '#2277ee'};
    }
  }

  /* Fix для предотвращения мерцания при наведении */
  .leaflet-marker-icon, .leaflet-marker-shadow {
    transition: transform 0.1s ease !important;
  }

  .place-label {
    background: none !important;
    border: none !important;
    box-shadow: none !important;
    color: ${props => props.theme?.colors?.text || '#000000'} !important;
    font-size: 10px !important;
    font-weight: bold !important;
    padding: 0 !important;
    white-space: nowrap !important;
    transition: opacity 0.3s ease !important;

    &::before {
      display: none !important;
    }
  }

  .leaflet-popup {
    margin-bottom: 20px;
  }

  .leaflet-popup-content-wrapper {
    padding: 5px;
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    width: 500px !important;
  }

  .leaflet-popup-content {
    margin: 0;
    max-width: 500px !important;
    width: 500px !important;
    border-radius: 8px;
  }

  .place-popup {
    .place-card {
      display: flex;
      background: white;

      .place-image {
        width: 120px !important;
        height: 150px !important;
        object-fit: cover;
        border-radius: 4px;
      }

      .place-content {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        min-height: 150px;
        padding: 0px 10px 5px 10px !important;
        flex: 1;

        h3 {
          margin: 0;
          font-size: 16px;
          color: ${props => props.theme?.colors?.text || '#000000'};
          font-weight: 600;
        }

        p {
          margin: 10px 0;
          font-size: 14px;
          color: ${props => props.theme?.colors?.textSecondary || '#666666'};
          line-height: 1.4;
        }

        .place-links-social {
          display: flex;
          gap: 10px;
          margin-top: auto;

          a {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background: ${props => props.theme?.colors?.background || '#ffffff'};
            transition: all 0.3s ease;

            &:hover {
              background: ${props => props.theme?.colors?.hover || '#2277ee'};
              transform: scale(1.1);
            }

            img {
              width: 18px;
              height: 18px;
            }
          }
        }
      }
    }
  }

  .map-popup-mobile {
    display: none;
    position: fixed;
    bottom: 30px;
    left: 10px;
    right: 10px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 5px;
    z-index: 1000;
    max-width: 600px;
    max-height: 25vh;
    overflow-y: auto;
    margin-left: auto;
    margin-right: auto;

    &.active {
      display: flex !important;
    }

    .place-card {
      display: flex;
      width: 100%;
      gap: 10px;

      .place-image {
        width: 90px;
        height: 130px;
        object-fit: cover;
        border-radius: 4px;
        flex-shrink: 0;
      }

      .place-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 110px;

        h3 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
        }

        p {
          margin: 5px 0px 5px 0px;
          font-size: 12px;
          color: ${props => props.theme?.colors?.textSecondary || '#666666'};
        }

        .place-links-social {
          display: flex;
          gap: 10px;
          margin-top: auto;

          img {
            width: 27px;
            height: 27px;
          }
        }
      }
    }

    .close-btn-mobile {
      position: absolute;
      top: 10px;
      right: 10px;
      font-size: 24px;
      color: ${props => props.theme?.colors?.closeButton || '#ff4444'};
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      line-height: 1;
      z-index: 1001;
    }
  }

  @media (max-width: 768px) {
    .leaflet-popup {
      display: none !important;
    }

    .leaflet-popup-content-wrapper,
    .leaflet-popup-content {
      width: auto !important;
      max-width: calc(100vw - 40px) !important;
    }

    .map-popup-mobile {
      display: none;

      &.active {
        display: flex;
      }
    }
  }
`;

export default GlobalStyles;
